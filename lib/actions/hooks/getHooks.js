const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function getHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    podio.get('/hook/' + data.ref_type + "/" + data.ref_id)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

};