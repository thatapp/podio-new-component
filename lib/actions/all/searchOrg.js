var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function searchOrg(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var item = msg.body;

    var fields = {};
    fields.org_id = parseInt(cfg.orgId);
    if(item.counts) {
        fields.counts = (item.counts == "true") ? true : false;
    }
    if(item.highlights) {
        fields.highlights = (item.highlights == "true") ? true : false;
    }
    if(item.limit) {
        fields.limit = item.limit;
    }

    if(item.offset) {
        fields.offset = item.offset;
    }
    if(item.query) {
        fields.query = item.query;
    }
    if(item.ref_type) {
        fields.ref_type = item.ref_type;
    }
    if(item.search_fields) {
        fields.ref_type = item.search_fields;
    }

    podio.get('/search/org/'+ cfg.orgId +'/v2',fields)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

exports.organisations = async function getOrganisations(cfg, cb) {
    let that = this;
    var podio = new Podio(cfg, this);

    var orgs = await podio.get('/org/');

    var result = {};
    orgs.forEach(function (value, key) {
        result[value.org_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
};


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

