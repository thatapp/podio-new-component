const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function getItemReferences(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    var url = '/item/'+ cfg.item_id + '/reference/';

    const items_references = await podio.get(url).fail(e.handleFailed(this));

    helper.emitData(cfg,items_references,that);
};

