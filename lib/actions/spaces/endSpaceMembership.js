const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function endSpaceMembership(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.space_id = data.space_id;
    fields.user_id = data.user_id;

    try {
        // BUG FIX: previous code was `var spaceMember = podio.delete(...).fail(...)`
        // — NO await. The function returned before the DELETE actually
        // completed, and helper.emitData emitted a raw Promise downstream.
        await podio.delete('/space/' + data.space_id + '/member/' + data.user_id, fields);
        helper.emitData(cfg, { message: 'Space membership ended' }, that);
    } catch (err) {
        that.emit('error', err);
    }
};