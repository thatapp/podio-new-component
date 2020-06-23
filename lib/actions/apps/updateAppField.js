const Podio = require('../../../podio');
const space = require("../../../helpers/spaceHelper");
const helper = require('../../../helpers/itemHelper');


exports.process =  async function updateAppField(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var fields = {};
    fields.app_id = parseInt(data.appId);
    fields.field_id = parseInt(data.fieldId);

    var app_field = podio.put('/app/' + data.appId + "/field/" + data.fieldId,fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app_field,that);
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getCSPaceModel(cfg, cb);
};