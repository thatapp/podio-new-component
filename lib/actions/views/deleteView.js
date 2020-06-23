var Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function deleteView(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var deleteView = podio.delete('/view/' + data.view_id).fail(e.handleFailed(this));

    helper.emitData(cfg,deleteView,that);

};