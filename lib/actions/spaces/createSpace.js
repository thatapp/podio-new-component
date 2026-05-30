const Podio = require('../../../podio');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");
const helper = require('../../../helpers/itemHelper');
const e = require("../../../helpers/elasticoHelper");

exports.process = async function createSpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var fields = {};
    fields.org_id = parseInt(cfg.orgId);
    if(cfg.privacy) {
        fields.privacy = cfg.privacy;
    }
    fields.auto_join = (cfg.auto_join == "true") ? true: false;
    fields.name = item.name;
    fields.post_on_new_app = (cfg.post_on_new_app == "true") ? true: false;
    fields.post_on_new_member = (cfg.post_on_new_member == "true") ? true : false;

    try {
        const items = await podio.post('/space/', fields);
        helper.emitData(cfg, items, that);
    } catch (err) {
        that.emit('error', err);
    }
};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getMetaModel(cfg, cb);
};
