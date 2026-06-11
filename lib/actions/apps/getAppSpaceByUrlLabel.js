const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getAppSpaceByUrlLabel(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { space_id, urlLabel } = msg.body;

    if (!space_id) {
        throw new Error('Space_id field is required');
    }
    if (!urlLabel) {
        throw new Error('Url_label field is required');
    }
    try {
        const app = await podio.get(`/app/space/${space_id}/${urlLabel}`);
        helper.emitData(cfg, app, that);
    } catch (err) {
        that.emit('error', err);
    }
};