const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const org = require("../../../helpers/orgHelper");

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = cfg.body;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/' + orgId)
        .then(function(org){
            e.emit(that, org);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};