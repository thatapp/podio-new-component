const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = msg.body;
    console.log(orgId);
    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    var org = podio.get('/org/'+ orgId +'/space').fail(e.handleFailed(this));

    helper.emitData(cfg,org,that);

};
