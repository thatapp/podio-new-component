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

    var spaceMember = podio.delete('/space/' +data.space_id+ '/member/'+ data.user_id ,fields).fail(e.handleFailed(this));

    helper.emitData(cfg,spaceMember,that);

};