const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function deleteAppField(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { AppId, fieldId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }
    if (!fieldId) {
        throw new Error('Field_id is required');
    }
    try {
        const app = await podio.delete(`/app/${AppId}/field/${fieldId}`);
        helper.emitData(cfg, app, that);
    } catch (err) {
        that.emit('error', err);
    }
};