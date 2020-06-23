const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function validateHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.code = data.hook_id;

    var hook = podio.post('/hook/'+ data.hook_id +'/verify/validate',fields).fail(e.handleFailed(this));

    helper.emitData(cfg,hook,that);

};

