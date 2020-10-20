const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function createHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const fields = {
        'url': cfg.url,
        'type': cfg.hook_type,
    };
    types = cfg.hook_type;
    let data = {};

    if (cfg.hookType == "space") {
        data.ref_type = "space";
    } else if (cfg.hookType == "app") {
        data.ref_type = "app";
    } else {
        data.ref_type = "app_field";
    }
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
    var hooks;

    if (cfg.hookType == "space") {
        hooks = space;
    } else if (cfg.hookType == "app") {
        hooks = app;
    } else {
        hooks = app;
    }
    return cb(null, hooks);
}
