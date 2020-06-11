var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;


var outScheme = {
    refId : {
        type: 'number',
        required: false,
        title: 'Ref ID'
    }
};

exports.process = async function updateItem(msg, cfg) {
    var that = this;
    var item = msg.body;
    var item_id = msg.body.item_id;

    if (!item_id) {
        throw new Error('Item_id field is required');
    }
    var podio = new Podio(cfg);

    var data = transformFields(item);
    var fields = {};
    fields.fields = data;

    var items = await podio.put('/item/' + item_id, fields).fail(messages.emitError.bind(that));
    console.log("Result" + JSON.stringify(items));

    that.emit('data', messages.newMessageWithBody(items));

    function transformFields(item) {
        var data = {};
        for (var key in item) {
            if(key.toString() != "item_id") {
                if (typeof item[key] === 'object') {

                    if ((!_.isEmpty(item[key].value) && _.isUndefined(item[key].type)) && _.isUndefined(item[key].currency)) {
                        data[key.toString()] = parseInt(item[key].value);
                    } else if (!_.isEmpty(item[key].value)) {
                        data[key.toString()] = item[key];
                    }else{
                        data[key.toString()] = item[key].value;
                    }

                } else {
                    data[key.toString()] = item[key];
                }
            }
        }
        return data;
    }



};
// exports.applications = async function getApplication(cfg) {
//     var podio = new Podio(cfg, this);
//
//     var apps = await podio.get('/app/space/' + cfg.spaceId);
//
//     var result = {};
//     apps.forEach(function (value, key) {
//         if (value.status === "active") {
//             result[value.app_id] = value.config.name;
//         }
//     });
//     return JSON.parse(JSON.stringify(result));
// };
// exports.spaces = async function getSpaces(cfg, msg) {
//     //console.log(msg);
//     //console.log("Make API Call");
//     var podio = new Podio(cfg, this);
//     var spaces = await podio.get('/space/org/' + cfg.orgId);
//
//     var result = {};
//     spaces.forEach(function (value, key) {
//         result[value.space_id] = value.name;
//     });
//
//     return JSON.parse(JSON.stringify(result));
//
//
// };
// exports.organisations = async function getOrganisations(cfg, cb) {
//     let that = this;
//     var podio = new Podio(cfg, this);
//
//     var orgs = await podio.get('/org/');
//
//     var result = {};
//     orgs.forEach(function (value, key) {
//         result[value.org_id] = value.name;
//     });
//
//     return JSON.parse(JSON.stringify(result));
//     // cb(null, result)
//     //return result;
//
//
// };
exports.getMetaModel = function getMetaModel(cfg, cb) {

    var podio = new Podio(cfg, this);

    podio.get('/app/' + cfg.appId)
        .then(getSchema)
        .fail(cb)
        .done();

    function getSchema(app) {
        var schema;
        var itemProperties = {
            item_id: {
                type: 'number',
                required: true,
                title: 'Item ID'
            }
        };
        var outProperties;

        if (!_.isArray(app.fields)) return cb(new Error('No fields found'));

        itemProperties = _.extend(itemProperties, getProperties(app.fields));

        outProperties = _.extend(outScheme, itemProperties);

        schema = {
            'in': {
                type: 'object',
                properties: itemProperties
            },
            'out': {
                type: 'object',
                properties: outProperties
            }
        };

        return cb(null, schema);
    }

    function getProperties(fields) {
        function format(result, field) {
            var properties = getFieldProperties(field);
            if (properties) {
                if(field.status === "active") {
                    result[field.external_id] = properties;
                }
            }
        }
        return _(fields).transform(format, {}).value();
    }
}

/**
 * https://developers.podio.com/doc/items
 * @param field Podio field config
 * @returns field properties
 */
function getFieldProperties(field) {
    var props = {
        required: false,
        title: field.label
    };

    function getConf(type, title, required) {
        return {
            type: type,
            required: _.isBoolean(required) ? required : props.required,
            title: field.label + ' ' + title
        };
    }

    var getStrConf = getConf.bind(null, 'string');
    var getNumConf = getConf.bind(null, 'number');

    switch (field.type.toLowerCase()) {
        case 'number':
        case 'member':
        case 'contact':
        case 'progress':
        case 'video':
        case 'duration':
        case 'question':
            props.type = 'number';
            break;
        case 'category':
            props.type = 'number';
            break;
        case 'text':
        case 'state':
        case 'image':
        case 'tel':
        case 'date':
        case 'location':
            props.type = 'string';
            break;
        case 'money':
            props.type = 'object';
            props.properties = {
                value: getNumConf('(Value)'),
                currency: getStrConf('(Currency)')
            };
            break;
        case 'embed':
            props.type = 'object';
            props.properties = {
                embed: getNumConf('(Embed ID)'),
                file: getNumConf('(File ID)')
            };
            break;
        case 'email':
            props.type = 'object';
            props.properties = {
                type: getStrConf('(other|home|work)'),
                value: getStrConf('(Email)')
            };
            break;

        case 'phone':
            props.type = 'object';
            props.properties = {
                type: getStrConf('(mobile|work|home|main|work_fax|private|fax|other)'),
                value: getStrConf('(Phone No)')
            };
            break;
        case 'app':
            props.type = 'object';
            props.properties = {
                value: getStrConf('Item_id')
            };
            break;
        default:
            return undefined;
    }
    return props;
}
