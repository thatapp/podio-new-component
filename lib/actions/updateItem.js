var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;


var outScheme = {

};

exports.process = async function updateItem(msg, cfg) {
    var that = this;
    var item = msg.body;
    console.log("Update Item" + JSON.stringify(cfg));
    console.log("Update Item MSG" + JSON.stringify(msg));
    var podio = new Podio(cfg);

    var app = await podio.get('/app/' + cfg.appId);

    var resolvedApp = resolveAppFields(app);
 //   console.log("RESOLVED DATA" + JSON.stringify(resolvedApp));

    function resolveAppFields(app) {
        function isAppField(field) {
            return field.type === 'app' && _.isObject(item[field.external_id]);
        }

        var appFields = _.filter(app.fields, isAppField);

        if (_.isEmpty(appFields)) {
            return app;
        }

        async function getItemId(appField) {
            var itemField = item[appField.external_id];

            function replaceFieldValue(referencedItem) {
                item[appField.external_id] = referencedItem.item_id;
            }

            var fields = await podio.get('/item/app/' + itemField.app_id + '/external_id/' + itemField.value);

            return replaceFieldValue(fields);
        }

        function returnApp() {
            return app;
        }

        return Q.all(appFields.map(getItemId)).then(returnApp);
    };

    var transformedApp = transformFields(resolvedApp);
  //  console.log("Transformed DATA" + JSON.stringify(transformedApp));

    var item_ = updateItem(transformedApp);
    // .then(uploadAttachments)
    that.emit('data', messages.newMessageWithBody(item_));
    return item_;


    function transformFields(app) {
        var data = {};
        var fieldsMap = _.keyBy(app.fields, 'external_id');
        //field types not in the following list will be filtered
        function formatValue(value, key) {
            if (fieldsMap[key]) {
                switch (fieldsMap[key].type) {
                    case 'number':
                    case 'member':
                    case 'contact':
                    case 'progress':
                    case 'video':
                    case 'duration':
                    case 'question':
                    case 'category':
                    case 'image':
                        return +value;
                    case 'text':
                    case 'state':
                    case 'tel':
                        return String(value) || undefined;
                    case 'money':
                        value.value = +value.value || 0;
                        value.currency = (value.currency || '').toUpperCase();
                        return value;
                    case 'date':
                        if (value.start) {
                            value.start = moment.utc(value.start).format('YYYY-MM-DD HH:mm:ss');
                        }
                        if (value.end) {
                            value.end = moment.utc(value.end).format('YYYY-MM-DD HH:mm:ss');
                        }
                        return value;
                    case 'embed':
                    case 'location':
                    case 'app':
                        return value;
                }
            }
        }

        if (item.external_id) {
            data.external_id = item.external_id;
        }
        console.log("ITEM MAP" + JSON.stringify(item));

        data.fields = _.mapValues(item, formatValue);

        return data;
    }

    async function updateItem(data, files) {
        //console.log(data);
        if (!_.isEmpty(files)) {
            data.file_ids = _(files).pluck('file_id').compact().value();
        }

        function returnItem(newItemData) {
            data.fields.refId = newItemData.presence.ref_id;
            return data.fields;
        }
        console.log("FINAL DATA" + JSON.stringify(data));
        var items = await podio.post('/item/' + data.fields.itemId, data);

        return items
    }

};
exports.applications = async function getApplication(cfg) {
    var podio = new Podio(cfg, this);

    var apps = await podio.get('/app/space/' + cfg.spaceId);

    var result = {};
    apps.forEach(function (value, key) {
        if (value.status === "active") {
            result[value.app_id] = value.config.name;
        }
    });
    return JSON.parse(JSON.stringify(result));
};
exports.spaces = async function getSpaces(cfg, msg) {
    //console.log(msg);
    //console.log("Make API Call");
    var podio = new Podio(cfg, this);
    var spaces = await podio.get('/space/org/' + cfg.orgId);

    var result = {};
    spaces.forEach(function (value, key) {
        result[value.space_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));


};
exports.organisations = async function getOrganisations(cfg, cb) {
    let that = this;
    var podio = new Podio(cfg, this);

    var orgs = await podio.get('/org/');

    var result = {};
    orgs.forEach(function (value, key) {
        result[value.org_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
    // cb(null, result)
    //return result;


};
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
                type: 'string',
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
        required: field.config.required || false,
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
        case 'category':
            props.type = 'number';
            break;
        case 'text':
        case 'state':
        case 'image':
        case 'tel':
            props.type = 'string';
            break;
        case 'date':
            props.type = 'object';
            props.properties = {
                start: getStrConf('(Start)'),
                end: getStrConf('(End)', false)
            };
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
        case 'location':
            props.type = 'object';
            props.properties = {
                value: getStrConf('(Value)'),
                formatted: getStrConf('(Formatted)'),
                street_number: getStrConf('(Street number)'),
                street_name: getStrConf('(Street name)'),
                postal_code: getStrConf('(Postal code)'),
                city: getStrConf('(City)'),
                state: getStrConf('(State)'),
                country: getStrConf('(Country)'),
                lat: getStrConf('(Latitude)'),
                lng: getStrConf('(Longitude)')
            };
            break;
        case 'app':
            props.type = 'object';
            props.properties = {
                app_id: getStrConf('(App ID)'),
                value: getStrConf('(External ID)')
            };
            break;
        default:
            return undefined;
    }
    return props;
}
