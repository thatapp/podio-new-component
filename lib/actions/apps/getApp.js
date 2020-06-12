const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function getApp(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { AppId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }

    podio.get('/app/' + AppId)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));
};