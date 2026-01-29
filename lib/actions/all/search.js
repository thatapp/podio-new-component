var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');
const helper = require('../../../helpers/itemHelper');

exports.process =  async function search(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);

    var fields = {};
    if(cfg.counts) {
        fields.counts = (cfg.counts == "true") ? true : false;
    }
    if(cfg.highlights) {
        fields.highlights = (cfg.highlights == "true") ? true : false;
    }
    if(cfg.limit) {
        fields.limit = cfg.limit;
    }

    if(cfg.offset) {
        fields.offset = cfg.offset;
    }
    if(cfg.query) {
        fields.query = cfg.query;
    }
    if(cfg.ref_type) {
        fields.ref_type = cfg.ref_type;
    }
    if(cfg.search_fields) {
        fields.search_fields = cfg.search_fields;
    }
    console.log("fields:" + JSON.stringify(fields));

    var items = await podio.get('/search/v2',fields).fail(messages.emitError.bind(that));
    helper.emitData(cfg,items,that);
}

