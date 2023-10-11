const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');
const {messages} = require("elasticio-node");

exports.process = async function getItemReferences(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    var url = '/item/' + msg.body.item_id + '/reference/';

    const items_references = await podio.get(url).fail(e.handleFailed(this));
    // console.log(JSON.stringify(items_references));
    // console.log(items_references);
    //
    // helper.emitData(cfg, items_references, that);

    await that.emit('data', messages.newMessageWithBody(items_references));
};

