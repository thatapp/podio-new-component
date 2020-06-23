var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function filterItem(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var fields = item;
    var items = await podio.post('/item/app/' + item.app_id + '/filter/', fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,items,that);
};

