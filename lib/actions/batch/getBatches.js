const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getBatches(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    const app = await podio.get('/batch/').fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};