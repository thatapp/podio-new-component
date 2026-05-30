const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getAppDependencies(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { AppId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }
    try {
        const app = await podio.get(`/app/${AppId}/dependencies/`);
        helper.emitData(cfg, app, that);
    } catch (err) {
        that.emit('error', err);
    }
};