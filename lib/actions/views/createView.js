const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function createView(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    await podio.post('/view/app/' + data.app_id + "/",data)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));
};