const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function verifyHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;
    let fields = {};
    fields.code = data.code;

    var verify =  podio.post('/hook/'+ data.hook_id +'/verify/validate',fields).fail(e.handleFailed(this));

    helper.emitData(cfg,verify,that);

};

