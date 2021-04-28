const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function getItemReferences(msg, cfg) {
    const podio = new Podio(cfg);

    var url = `/item/app/${msg.body.app_id}/filter/${msg.body.view_id}/`;
    const item = await podio.post(url).fail(e.handleFailed(this));

    await this.emit('data', messages.newMessageWithBody(item));
    return item;
};

