const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

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
            e.emit(that, org);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

};