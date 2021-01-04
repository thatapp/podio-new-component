var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function install(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var fields = {};
    fields.space_id = item.spaceId;

    var items = await podio.post('/app/' + item.appId + '/install', fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg, items, that);

};

