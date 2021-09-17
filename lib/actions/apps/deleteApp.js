const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function deleteApp(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { AppId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }
    const app = await podio.delete(`/app/${AppId}`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};