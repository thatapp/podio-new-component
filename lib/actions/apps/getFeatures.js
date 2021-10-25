const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getFeatures(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    let item = msg.body;
    let fields = {};

    if (fields.appIds) {
        fields.appIds = item.appIds
    }

    if (fields.includeSpace) {
        fields.includeSpace = item.includeSpace
    }

    const app = await podio.get(`/app/features/`, fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};