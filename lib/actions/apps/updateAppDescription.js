var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function updateAppDescription(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var fields = {};
    fields.silent = item.silent;

    var items = await podio.put(`/app/${item.app_id}/description`, fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg, items, that);

};

