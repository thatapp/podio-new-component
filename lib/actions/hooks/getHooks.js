const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function getHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    const hooks = await podio.get('/hook/' + data.ref_type + "/" + data.ref_id).fail(messages.emitError.bind(that));

    if (cfg.splitResult && Array.isArray(hooks)) {
        for (const i_item of hooks) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(org));
    }

};