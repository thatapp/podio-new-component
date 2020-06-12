const Podio = require('../../../podio');
const _ = require('lodash');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function searchSpace(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var item = msg.body;

    var fields = {};
    fields.space_id = parseInt(cfg.spaceId);
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

    podio.get('/search/space/'+ cfg.spaceId +'/v2',fields)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

}

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};

exports.spaces = async function getSpaces(cfg, msg) {
    return space.getSpaces(cfg, msg);
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getCSPaceModel(cfg, cb);
};
