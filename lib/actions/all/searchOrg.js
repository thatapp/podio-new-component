const Podio = require('../../../podio');
const space = require("../../../helpers/spaceHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function searchOrg(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var item = msg.body;

    var fields = {};
    fields.org_id = parseInt(cfg.orgId);
    if(item.counts) {
        fields.counts = (item.counts === "true") ? true : false;
    }
    if(item.highlights) {
        fields.highlights = (item.highlights === "true") ? true : false;
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

    var orgs = await podio.get('/search/org/'+ cfg.orgId +'/v2',fields).fail(messages.emitError.bind(that));
    helper.emitData(cfg,orgs,that);


};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getCSPaceModel(cfg, cb);
};

