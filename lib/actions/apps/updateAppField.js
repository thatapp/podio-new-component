const Podio = require('../../../podio');
const _ = require('lodash');
const space = require("../../../helpers/spaceHelper");
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function updateAppField(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var fields = {};
    fields.app_id = parseInt(data.appId);
    fields.field_id = parseInt(data.fieldId);

    podio.put('/app/' + data.appId + "/field/" + data.fieldId,fields)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getCSPaceModel(cfg, cb);
};