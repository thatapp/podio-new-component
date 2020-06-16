const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function createHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const fields = msg.body;
    var app = ["item.create", "item.update",'form.delete','tag.delete','tag.add','form.update', "item.delete",'comment.create','comment.delete','file.change','app.update','app.delete','form.create'];
    var space = ["app.create", "task.create",'task.update','member.add','member.remove','contact.create', "contact.update",'contact.delete','status.create','status.update','status.delete'];

    let data = {};
    if (cfg.hookType == "space") {
        data.ref_type = "space";
        if(!space.includes(fields.type)){
            throw new Error('Invalid Hook Type, supported hook types are (item.create,item.update,form.delete,tag.delete,tag.add,form.update, item.delete,comment.create,comment.delete,file.change,app.update,app.delete,form.create)');
        }
    } else if (cfg.hookType == "app") {
        data.ref_type = "app";
        if(!app.includes(fields.type)){
            throw new Error('Invalid Hook Type, supported hook types are (app.create, task.create,task.update,member.add,member.remove,contact.create, contact.update,contact.delete,status.create,status.update,status.delete)');
        }
    } else {
        data.ref_type = "app_field";
        if(!app.includes(fields.type)){
            throw new Error('Invalid Hook Type, supported hook types are (app.create, task.create,task.update,member.add,member.remove,contact.create, contact.update,contact.delete,status.create,status.update,status.delete)');
        }
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
