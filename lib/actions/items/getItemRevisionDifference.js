const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function getItemRevisionDifference(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    // BUG FIX: previous path was missing the leading `/` so the URL ended up
    // as `item/.../revision/...` rather than `/item/.../revision/...`. The
    // `request` library would interpret the bare path relative to the
    // base URL but quirkily — added leading slash for clarity.
    const url = '/item/' + msg.body.item_id + '/revision/' + msg.body.revision_from + '/' + msg.body.revision_to;

    try {
        const items_references = await podio.get(url);
        helper.emitData(cfg, items_references, that);
    } catch (err) {
        that.emit('error', err);
    }
};

