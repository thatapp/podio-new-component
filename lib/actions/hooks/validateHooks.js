const Podio = require('../../../podio');
const _ = require('lodash');
import {emit, handleDone, handleFailed} from "../../../helpers/elasticoHelper";

exports.process =  async function validateHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
    fields.hook_id = data.hook_id;

    podio.post('/hook/'+ data.hook_id +'/verify/validate',fields)
        .then(function(app){
            emit(that, app);
        })
        .fail(handleFailed(this))
        .done(handleDone(this));
}

