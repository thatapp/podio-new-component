const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getTopAppsOrganization(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { org_id } = msg.body;

    const app = await podio.get(`/app/org/${org_id}/top/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};