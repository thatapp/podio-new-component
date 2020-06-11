const Podio = require('../../../podio');
const _ = require('lodash');
import {emit, handleDone, handleFailed} from "../../../helpers/elasticoHelper";

exports.process =  async function createHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.ref_type = data.ref_type;
    fields.ref_id = data.ref_id;

    podio.post('/hook/' + data.ref_type + "/" + data.ref_id, fields)
        .then(function(app){
            emit(that, app);
        })
        .fail(handleFailed(this))
        .done(handleDone(this));
};

