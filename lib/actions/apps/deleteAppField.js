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
    const app = await podio.delete(`/app/${AppId}/field/${fieldId}`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};