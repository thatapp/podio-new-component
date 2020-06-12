const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function updateSpaceMembership(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.space_id = data.space_id;
    fields.user_ids = data.user_ids;

    podio.put('/space/' +data.space_id+ '/member/'+ data.user_ids ,fields)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));
};