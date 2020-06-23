var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function getViews(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);
    var items = await podio.get('/view/app/' + item.app_id).fail(messages.emitError.bind(that));
    helper.emitData(cfg,items,that);
};

