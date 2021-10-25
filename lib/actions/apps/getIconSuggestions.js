const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getIconSuggestions(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { query } = msg.body;

    const app = await podio.get(`/app/icon/search/`, query).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};