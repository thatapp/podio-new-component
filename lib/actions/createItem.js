var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');

var outScheme = {
    refId: {
        type: 'number',
        required: true,
        title: 'Ref ID'
    }
};

exports.process = async function createItem(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    await podio.get('/app/' + cfg.appId)
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
exports.applications = function getApplication(cfg) {
    var podio = new Podio(cfg, this);

    podio.get('/app/', {limit: 100})
        .then((apps) => {
            var result = [];
            apps.forEach(function (value, key) {
                if (value.status === "active") {
                    console.log(key);
                    result[value.app_id] = value.config.name;
                }
            });

            return result;
        })
        .fail(err => {
            console.log('Error occurred', err.stack || err);
        })
        .done();

};
exports.spaces = async function getSpaces(cfg, msg) {
    console.log(msg);
    console.log("Make API Call");
    var podio = new Podio(cfg, this);
    var spaces = await podio.get('/space/top/', {limit: 100});

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
