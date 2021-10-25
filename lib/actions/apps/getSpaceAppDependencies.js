const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getSpaceAppDependencies(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { space_id } = msg.body;

    const app = await podio.get(`/space/${space_id}/dependencies/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};