const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getRunningBatches(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { ref_type, ref_id, plugin } = msg.body;

    if (!ref_type) {
        throw new Error('Ref Type field is required');
    }
    if (!ref_id) {
        throw new Error('Ref Id field is required');
    }
    if (!plugin) {
        throw new Error('Plugin field is required');
    }
    const app = await podio.get(`/batch/${ref_type}/${ref_id}/${plugin}/running/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};