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

    data.ref_type = "app_field";

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
    var app = {
        'app.delete': 'app.delete',
        'app.update': 'app.update',
        'comment.create': 'comment.create',
        'comment.delete': 'comment.delete',
        'file.change': 'file.change',
        'form.create': 'form.create',
        'form.delete': 'form.delete',
        'form.update': 'form.update',
        "item.create": "item.create",
        "item.delete": "item.delete",
        "item.update": "item.update",
        'tag.add': 'tag.add',
        'tag.delete': 'tag.delete'
    };

    return cb(null, app);
};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};

exports.spaces = async function getSpaces(cfg, msg) {
    return space.getSpaces(cfg, msg);
};

exports.applications = async function getApplication(cfg,msg) {
    return space.getApplication(cfg, msg);
};

exports.fields = async function getFields(cfg,msg) {
    return space.getFields(cfg, msg);
};
