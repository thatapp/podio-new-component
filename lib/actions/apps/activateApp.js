const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function activateApp(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { AppId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }
    const app = await podio.post(`/app/${AppId}/activate`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};