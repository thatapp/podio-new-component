const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function getHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    const hooks = await podio.get('/hook/' + data.ref_type + "/" + data.ref_id).fail(messages.emitError.bind(that));
    helper.emitData(cfg,hooks,that);

};