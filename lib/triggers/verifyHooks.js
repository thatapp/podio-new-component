const Podio = require('../../podio');
const _ = require('lodash');
const e = require("../../helpers/elasticoHelper");

exports.process =  async function verifyHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.code = data.code;

    podio.post('/hook/'+ data.hook_id +'/verify/validate',fields)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));
};