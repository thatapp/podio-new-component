const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");

exports.process = async function createSpaceHook(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const fields = {
        'url': cfg.url,
        'type': cfg.hook_type,
    };
    types = cfg.hook_type;
    let data = {};

    data.ref_type = "space";

    let response = [];

    var url = '/hook/' + data.ref_type + "/" + cfg.ref_id;

    await types.forEach(podio_post);

    async function podio_post(item, index) {
        try{
            fields.type = item;
            let res = await podio.post(url, fields);
            response.push(res);
            response.length === types.length && helper.emitData(cfg,response,that);
        }
        catch(x){
            e.handleFailed(x);
        }
    }

};

exports.getHooks = function getHooks(cfg, cb) {
    var space = {
        "app.create": "app.create",
        'contact.create': 'contact.create',
        'contact.delete': 'contact.delete',
        "contact.update": "contact.update",
        'member.add': 'member.add',
        'member.remove': 'member.remove',
        'status.create': 'status.create',
        'status.update': 'status.update',
        'status.delete': 'status.delete',
        "task.create": "task.create",
        'task.update': "task.update"

    };

    return cb(null, space);
}
exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};

exports.spaces = async function getSpaces(cfg, msg) {
    return space.getSpaces(cfg, msg);
};
