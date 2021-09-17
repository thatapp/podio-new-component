const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getAppSpaceByUrlLabel(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { spaceId, urlLabel } = msg.body;

    if (!spaceId) {
        throw new Error('Space_id field is required');
    }
    if (!urlLabel) {
        throw new Error('Url_label field is required');
    }
    const app = await podio.get(`/app/space/${spaceId}/${urlLabel}`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};