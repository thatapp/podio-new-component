const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const org = require("../../../helpers/orgHelper");
const {messages} = require('elasticio-node');

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = cfg.body;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/' + orgId)
        .then(function(org){
            if (cfg.splitResult && Array.isArray(org)) {
                for (const i_item of org) {
                    const output = messages.newMessageWithBody(i_item);
                    e.emit('data', output);
                }
                e.emit('end');
            } else {
                e.emit('data', messages.newMessageWithBody(org));
            }
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};