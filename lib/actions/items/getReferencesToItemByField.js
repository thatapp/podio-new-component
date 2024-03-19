const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function getReferencesToItemByField(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    var url = "/item/" + msg.body.item_id + "/reference/field/" + msg.body.field_id;

    let fields = {};

    fields.limit = msg.body.limit;
    fields.offset = msg.body.offset;

    const items_references = await podio.get(url,fields).fail(e.handleFailed(this));

    helper.emitData(cfg,items_references,that);
};

