var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");

exports.process = async function updateSpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);
    console.log(JSON.stringify(item));

    var fields = {};
    fields.org_id = parseInt(cfg.orgId);
    if(item.privacy) {
        fields.privacy = item.privacy;
    }
    if(item.auto_join) {
        fields.auto_join = (item.auto_join == "true") ? true : false;
    }
    fields.name = item.name;
    if(item.post_on_new_app) {
        fields.post_on_new_app = (item.post_on_new_app == "true") ? true : false;
    }
    if(item.post_on_new_member) {
        fields.post_on_new_member = (item.post_on_new_member == "true") ? true : false;
    }

    var items = await podio.put('/space/', fields);

    that.emit('data', messages.newMessageWithBody(items));

    return items;

};

exports.organisations = async function getOrganisations(cfg, cb) {
   return org.getOrganisations(cfg, cb);
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getMetaModel(cfg, cb);
};