const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function validateHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.code = data.hook_id;

    try {
        // BUG FIX: previous code was `var hook = podio.post(...).fail(...)` —
        // NO await. `hook` was a Promise, the function returned before the
        // POST completed, and helper.emitData emitted the unresolved Promise.
        const hook = await podio.post('/hook/' + data.hook_id + '/verify/request', fields);
        helper.emitData(cfg, hook, that);
    } catch (err) {
        that.emit('error', err);
    }
};

