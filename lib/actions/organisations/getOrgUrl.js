const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');


exports.process =  async function getOrgUrl(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const url = msg.body.url;

    if (!url) {
        throw new Error('URL field is required');
    }
    let fields = {};
    fields.url = url;

    var org_url = podio.get('/org/url',fields).fail(e.handleFailed(this));

    helper.emitData(cfg,org_url,that);

};