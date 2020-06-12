var Podio = require('../../../podio');
var _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function deleteView(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    podio.delete('/view/' + data.view_id)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

};