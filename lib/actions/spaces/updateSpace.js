var Podio = require('../../../podio');
const {messages} = require('elasticio-node');


exports.process = async function updateSpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);
    console.log(item);

    var fields = {};
    fields.org_id = item.orgId;
    if(item.privacy) {
        fields.privacy = (item.privacy == "true") ? true : false;
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

    var items = await podio.put(' /space/', fields);

    that.emit('data', messages.newMessageWithBody(items));

    return items;

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

