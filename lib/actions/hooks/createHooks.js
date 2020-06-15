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
    // if (cfg.hookType == "space") {
    //
    // } else if (cfg.hookType == "app") {
    //
    // } else {
    //
    // }
    schema = {
        'in': {
            type: 'object',
            properties:
                {
                    type: "model",
                    required: "required",
                    title: "Item Create",
                    model: {
                        "item.create": "item create",
                        "item.update": "item Update",
                    }
                }

        },

    };

    return cb(null, schema);
};
