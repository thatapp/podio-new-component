const Podio = require('../../../podio');
const _ = require('lodash');
import {emit, handleDone, handleFailed} from "../../../helpers/elasticoHelper";

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = cfg.body;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/' + orgId)
        .then(function(org){
            emit(that, org);
        })
        .fail(handleFailed(this))
        .done(handleDone(this));

};

exports.organisations = async function getOrganisations(cfg, cb) {
    let that = this;
    const podio = new Podio(cfg, this);
    const orgs = await podio.get('/org/');

    let result = {};
    orgs.forEach(function (value, key) {
        result[value.org_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
};