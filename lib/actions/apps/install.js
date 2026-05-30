var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function install(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var fields = {};
    fields.space_id = item.spaceId;

    try {
        const items = await podio.post('/app/' + item.appId + '/install', fields);
        helper.emitData(cfg, items, that);
    } catch (err) {
        that.emit('error', err);
    }
};

