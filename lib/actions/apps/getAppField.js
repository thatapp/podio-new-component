const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getAppField(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { app_id, fieldOrExternalId } = msg.body;

    if (!app_id) {
        throw new Error('App_id field is required');
    }
    if (!fieldOrExternalId) {
        throw new Error('Field_or_external_id is required');
    }
    try {
        const app = await podio.get(`/app/${app_id}/field/${fieldOrExternalId}`);
        helper.emitData(cfg, app, that);
    } catch (err) {
        that.emit('error', err);
    }
};