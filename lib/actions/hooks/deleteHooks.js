const endpoint = require("../../../helpers/podioEndpont");
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function deleteHooks(msg, cfg) {
    const that = this;
    const data = msg.body;

    endpoint.podioDelete(cfg, data.hook_id)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

};