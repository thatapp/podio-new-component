const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getAppByLabel(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgLabel, spaceLabel, appLabel } = msg.body;

    if (!orgLabel) {
        throw new Error('Org_label field is required');
    }
    if (!spaceLabel) {
        throw new Error('Space_label field is required');
    }
    if (!appLabel) {
        throw new Error('App_label field is required');
    }
    const app = await podio.get(`/app/org/${orgLabel}/space/${spaceLabel}/${appLabel}`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};