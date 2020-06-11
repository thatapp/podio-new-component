const Podio = require('../../../podio');
const _ = require('lodash');
import {emit, handleDone, handleFailed} from "../../../helpers/elasticoHelper";

exports.process =  async function getHooks(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    podio.get('/hook/' + data.ref_type + "/" + data.ref_id)
        .then(function(app){
            emit(that, app);
        })
        .fail(handleFailed(this))
        .done(handleDone(this));

};