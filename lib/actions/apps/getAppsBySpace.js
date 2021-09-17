const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getAppsBySpace(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { spaceId, includeInactive } = msg.body;

    if (!spaceId) {
        throw new Error('Space_id field is required');
    }
    if (!includeInactive) {
        throw new Error('Include_inactive field is required');
    }
    const app = await podio.get(`/app/space/${spaceId}/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};