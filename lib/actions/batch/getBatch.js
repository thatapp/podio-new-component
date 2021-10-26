const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getBatch(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { batchId } = msg.body;

    if (!batchId) {
        throw new Error('Batch ID field is required');
    }
    const app = await podio.get('/batch/' + batchId).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};