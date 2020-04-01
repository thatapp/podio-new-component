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

exports.process = async function createItem(msg, cfg) {
    var that = this;
     var item = msg.body;
  //  var item = JSON.parse('{"duration":2,"location":"650 Townsend St., San Francisco, CA 94103","progress":45,"money":{"currency":"USD","value":123},"number":45,"email":{"value":"williamnwogbo@gmail.com","type":"home"},"phone":{"value":"07039448968","type":"home"},"workspacecontacts":197795122,"contactspaceexternalmembers":68718029,"contactspacemembersonly":68718029,"relationshipmultiple":{"value":[1333494153,1330027948]},"relationshipsingle":{"value":1333494153},"date":"2019-02-03 23:59:59","categorymultiple":[1,2],"categorysingle":1,"textmultiline":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum","textsingleline":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"}');
    var podio = new Podio(cfg);
    var data = transformFields(item);

    var fields = {};
    fields.fields = data;
   console.log(JSON.stringify(fields));
    var items = await podio.post('/item/app/' + cfg.appId, fields);

    that.emit('data', messages.newMessageWithBody(items));

   return items;


    function transformFields(item) {
        var data = {};
        for (var key in item) {

            if (typeof item[key] === 'object') {
                if((!_.isEmpty(item[key].value) && _.isUndefined(item[key].type))  &&  _.isUndefined(item[key].currency)){
                    data[key.toString()] = parseInt(item[key].value);
                }else if (!_.isEmpty(item[key].value)) {
                    data[key.toString()] = item[key];
                }else if(_.isUndefined(item[key].value)){
                    data[key.toString()] = item[key];
                }else{
                    data[key.toString()] = item[key].value;
                }
            } else {
               data[key.toString()] = item[key];
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
//     console.log(msg);
//     console.log("Make API Call");
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
            external_id: {
                type: 'string',
                required: false,
                title: 'External ID'
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

        // function isActive(field) {
        //     return 'active' === field.status;
        // }

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
        case 'text':
        case 'state':
        case 'image':
        case 'tel':
        case 'date':
        case 'location':
        case 'tags':
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
