const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getAppField(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { AppId, fieldOrExternalId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }
    if (!fieldOrExternalId) {
        throw new Error('Field_or_external_id is required');
    }
    const app = await podio.get(`/app/${AppId}/field/${fieldOrExternalId}`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};