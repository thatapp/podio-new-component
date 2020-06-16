const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function createHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const fields = msg.body;
    let data = {};

    if (cfg.hookType == "space") {
        data.ref_type = "space";
    } else if (cfg.hookType == "app") {
        data.ref_type = "app";
    } else {
        data.ref_type = "app_field";
    }


var url = '/hook/' + data.ref_type + "/" + cfg.ref_id;
    podio.post(url, fields)
        .then(function (hook_data) {
            console.log(hook_data);
            e.emit(that, hook_data);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));
};

exports.getHooks = function getHooks(cfg, cb) {
    var space = {
        "app.create" : "app.create",
        "task.create" : "task.create",
        'task.update': "task.update",
        'member.add': 'member.add',
        'member.remove': 'member.remove',
        'contact.create': 'contact.create',
        "contact.update": "contact.update",
        'contact.delete': 'contact.delete',
        'status.create': 'status.create',
        'status.update': 'status.update',
        'status.delete': 'status.update'
    };

    var app = {
        "item.create": "item.create",
        "item.update": "item.update",
        'form.delete': 'form.delete',
        'tag.delete': 'tag.delete',
        'tag.add': 'tag.add',
        'form.update': 'form.update',
        "item.delete": "item.delete",
        'comment.create': 'comment.create',
        'comment.delete': 'comment.delete',
        'file.change': 'file.change',
        'app.update': 'app.update',
        'app.delete': 'app.delete',
        'form.create': 'form.create'
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

exports.getMetaModel = function getMetaModel(cfg, cb) {
    var item_property;
    var outProperties = {};

    item_property = {
        type: {
            type: "string",
            required: "required",
            title: "Hook Type",
            description: "E.g item.create, item.update etc. Check out the Podio Hook Documentation https://developers.podio.com/doc/hooks"
        },
        url: {
            type: "string",
            required: "required",
            title: "URL",
        }
    };

    schema = {
        'in': {
            type: 'object',
            properties: item_property
        },
        'out': {
            type: 'object',
            properties: outProperties
        }

    };

    return cb(null, schema);
};
