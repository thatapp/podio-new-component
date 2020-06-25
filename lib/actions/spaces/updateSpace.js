var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function updateSpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var fields = {};
    fields.org_id = parseInt(cfg.orgId);
    if(cfg.privacy) {
        fields.privacy = cfg.privacy;
    }
    if(cfg.auto_join) {
        fields.auto_join = (cfg.auto_join == "true") ? true : false;
    }
    fields.name = item.name;
    if(cfg.post_on_new_app) {
        fields.post_on_new_app = (cfg.post_on_new_app == "true") ? true : false;
    }
    if(cfg.post_on_new_member) {
        fields.post_on_new_member = (cfg.post_on_new_member == "true") ? true : false;
    }

    var spaces = await podio.put('/space/', fields).fail(messages.emitError.bind(that));
    helper.emitData(cfg,spaces,that);

};

exports.organisations = async function getOrganisations(cfg, cb) {
   return org.getOrganisations(cfg, cb);
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getMetaModel(cfg, cb);
};