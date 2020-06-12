const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = msg.body.orgId;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/'+ orgId +'/all_spaces/')
        .then(function(org){
            e.emit(that, org);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

}
