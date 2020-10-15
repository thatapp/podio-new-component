const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function getItemReferences(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    var url = '/item/field/'+ cfg.field_id + '/find';
    let fields = {};

    fields.limit = msg.body.limit;
    fields.not_item_id = msg.body.not_item_id;
    fields.text = msg.body.text;

    const items_references = await podio.get(url,fields).fail(e.handleFailed(this));

    helper.emitData(cfg,items_references,that);
};

