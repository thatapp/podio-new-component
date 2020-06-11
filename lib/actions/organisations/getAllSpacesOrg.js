const Podio = require('../../../podio');
const _ = require('lodash');
import {emit, handleDone, handleFailed} from "../../../helpers/elasticoHelper";

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = msg.body.orgId;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/'+ orgId +'/all_spaces/')
        .then(function(org){
            emit(that, org);
        })
        .fail(handleFailed(this))
        .done(handleDone(this));

}
