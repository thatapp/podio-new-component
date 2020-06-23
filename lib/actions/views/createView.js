const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function createView(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    var create_view = await podio.post('/view/app/' + data.app_id + "/",data).fail(e.handleFailed(this));

    helper.emitData(cfg,create_view,that);
};