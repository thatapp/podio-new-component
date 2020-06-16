const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function createHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.ref_type = data.ref_type;
    fields.ref_id = data.ref_id;

    podio.post('/hook/' + data.ref_type + "/" + data.ref_id, fields)
        .then(function (app) {
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));
};


exports.getMetaModel = function getMetaModel(cfg, cb) {
    console.log(cfg.hookType);
    var item_property;
    var outProperties = {};
    if (cfg.hookType == "space") {
        item_property = [
            {
            type: "object",
            required: "required",
            title: "Item Create",
            model: {
                "item.create": "item create",
                "item.update": "item Update",
            }
        }
        ];
    } else if (cfg.hookType == "app") {
        item_property = [{
            type: "string",
            required: "required",
            title: "Item Create",
            model: {
                "item.create": "item create",
                "item.update": "item Update",
            }
        }]
    } else {
        item_property = [{
            type: "string",
            required: "required",
            title: "Hook Type",
            description: "E.g item.create, item.update etc."
        }]
    }
    schema = {
        'in': {
            type: 'object',
            properties:item_property
        },
        'out': {
            type: 'object',
            properties: outProperties
        }

    };

    return cb(null, schema);
};
