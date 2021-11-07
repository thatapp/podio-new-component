const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getGlobalExports(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    const globalExports = await podio.get(`/calendar/export/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,globalExports,that);
};