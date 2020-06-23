const endpoint = require("../../../helpers/podioEndpont");
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function deleteHooks(msg, cfg) {
    const that = this;
    const data = msg.body;

    var deletedHooks = endpoint.podioDelete(cfg, data.hook_id).fail(e.handleFailed(this))
        .done(e.handleDone(this));

    helper.emitData(cfg,deletedHooks,that)

};