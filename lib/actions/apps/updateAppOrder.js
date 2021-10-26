var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function updateAppOrder(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var items = await podio.put(`/app/space/${item.space_id}/order`).fail(messages.emitError.bind(that));

    helper.emitData(cfg, items, that);

};

