const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const org = require("../../../helpers/orgHelper");
const helper = require('../../../helpers/itemHelper');

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = cfg.body;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    var org = podio.get('/org/' + orgId).fail(e.handleFailed(this));

    helper.emitData(cfg,org,that);

};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};