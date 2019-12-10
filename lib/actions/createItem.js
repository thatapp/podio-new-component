var Q = require('q');
var _ = require('lodash');
var moment = require('moment');
var Podio = require('../../podio');
var getApplications = require('../../commons').getApplications;
var getSpaces = require('../../commons').getSpaces;
var s3client = require('s3');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;
const { messages } = require('elasticio-node');

var outScheme = {
    refId : {
        type: 'number',
        required: true,
        title: 'Ref ID'
    }
};

exports.process = async function createItem(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    podio.get('/app/' + cfg.appId)
        .then(resolveAppFields)
        .then(transformFields)
        .then(uploadAttachments)
        .spread(insertItem)
        .then(emitData)
        .catch(onFail)
        .done(messages.emitEnd.bind(that));

    function resolveAppFields(app) {
        function isAppField(field) {
            return field.type === 'app' && _.isObject(item[field.external_id]);
        }
        var appFields = _.filter(app.fields, isAppField);

        if (_.isEmpty(appFields)) {
            return app;
        }

        function getItemId(appField) {
            var itemField = item[appField.external_id];

            function replaceFieldValue(referencedItem) {
                item[appField.external_id] = referencedItem.item_id;
            }

            function fail(e) {
                if (e.statusCode === 404) {
                    e.rebound = true;
                }
                throw e;
            }

            return podio.get('/item/app/' + itemField.app_id + '/external_id/' + itemField.value)
                .then(replaceFieldValue)
                .catch(fail);
        }

        function returnApp() {
            return app;
        }

        return Q.all(appFields.map(getItemId)).then(returnApp);
    }

    function uploadAttachments(item) {
        var promises = _.map(msg.attachments, uploadAttachment);

        return Q.all(promises).then(resolve);

        function resolve(files) {
            return Q.all([item, files]);
        }

        function uploadAttachment(attachment, fileName) {
            if (attachment.s3) {
                return s3client.getEncrypted(attachment.s3).then(uploadFile);
            } else {
                return {};
            }

            function uploadFile(stream) {
                console.log('About to upload file `%s` into Podio', fileName);
                new HeartBeatStream(that).start(stream);
                return podio.uploadFileFromStream(fileName, stream);
            }
        }
    }

    function transformFields(app) {
        var data = {};
        var fieldsMap = _.indexBy(app.fields, 'external_id');

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
        data.fields = _.mapValues(item, formatValue);

        return data;
    }

    function insertItem(data, files) {
        if (!_.isEmpty(files)) {
            data.file_ids = _(files).pluck('file_id').compact().value();
        }

        function returnItem(newItemData) {
            data.fields.refId = newItemData.presence.ref_id;
            return data.fields;
        }

        return podio.post('/item/app/' + cfg.appId, data).then(returnItem);
    }

    function emitData(item) {
        that.emit('data', messages.newMessageWithBody(item));
        return item;
    }

    function onFail(e) {
        if (e.rebound || e.error === 'rate_limit') {
            that.emit('rebound', e);
        } else {
            that.emit('error', e);
        }
    }
};
exports.getApplications = getApplications;
exports.getSpaces = getSpaces;
exports.getMetaModel = getMetaModel;

function getMetaModel(cfg, cb) {
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
            'in' : {
                type : 'object',
                properties : itemProperties
            },
            'out': {
                type : 'object',
                properties : outProperties
            }
        };

        return cb(null, schema);
    }

    function getProperties(fields) {
        function format(result, field) {
            var properties = getFieldProperties(field);
            if (properties) {
                result[field.external_id] = properties;
            }
        }

        function isActive(field) {
            return 'active' === field.status;
        }

        return _(fields).filter(isActive).transform(format, {}).value();
    }
}

/**
 * https://developers.podio.com/doc/items
 * @param field Podio field config
 * @returns field properties
 */
function getFieldProperties(field) {
    var props = {
        required : field.config.required || false,
        title : field.label
    };

    function getConf(type, title, required) {
        return {
            type : type,
            required : _.isBoolean(required) ? required : props.required,
            title : field.label + ' ' + title
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
                start : getStrConf('(Start)'),
                end : getStrConf('(End)', false)
            };
            break;
        case 'money':
            props.type = 'object';
            props.properties = {
                value : getNumConf('(Value)'),
                currency : getStrConf('(Currency)')
            };
            break;
        case 'embed':
            props.type = 'object';
            props.properties = {
                embed : getNumConf('(Embed ID)'),
                file : getNumConf('(File ID)')
            };
            break;
        case 'location':
            props.type = 'object';
            props.properties = {
                value : getStrConf('(Value)'),
                formatted : getStrConf('(Formatted)'),
                street_number : getStrConf('(Street number)'),
                street_name : getStrConf('(Street name)'),
                postal_code : getStrConf('(Postal code)'),
                city : getStrConf('(City)'),
                state : getStrConf('(State)'),
                country : getStrConf('(Country)'),
                lat : getStrConf('(Latitude)'),
                lng : getStrConf('(Longitude)')
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