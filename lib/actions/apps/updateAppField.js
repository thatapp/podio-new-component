var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function updateAppField(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var fields = {};
    fields.app_id = parseInt(data.appId);
    fields.field_id = parseInt(data.fieldId);



    podio.put('/app/' + data.appId + "/field/" + data.fieldId,fields)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

exports.getMetaModel = function getMetaModel(cfg, cb) {
    var schema;
    var itemProperties = {
        counts: {
            type: "string",
            prompt: "Counts",
            label: "Counts(true,false)",

        },
        highlights: {
            type: "SelectView",
            label: "highlights(true,false)",
        },
        limit: {
            type: "number",
            label: "Limit",
            placeholder:"100"
        },
        offset: {
            type: "string",
            label: "Offset",
            placeholder:"0"
        },
        ref_type: {
            type: "string",
            prompt: "Ref Type",
            label: "Ref Type(item,task,file,conversation,profile,app)"
        },
        query: {
            type: "string",
            label: "query",
            placeholder:""
        },
        search_fields: {
            type: "string",
            label: "Search Fields",
            placeholder:""
        }
    };
    schema = {
        'in': {
            type: 'object',
            properties: itemProperties
        }
    };
    return cb(null, schema);
}

