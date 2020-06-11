import {emit, handleDone, handleFailed} from "../../../helpers/elasticoHelper";

const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const _ = require('lodash');

exports.process =  async function getOrgUrl(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const url = msg.body.url;

    if (!url) {
        throw new Error('URL field is required');
    }
    let fields = {};
    fields.url = url;

    podio.get('/org/url',fields)
        .then(function(org){
            emit(that, org);
        })
        .fail(handleFailed(this))
        .done(handleDone(this));

}



