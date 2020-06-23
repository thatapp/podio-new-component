const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const {messages} = require('elasticio-node');

exports.process =  async function getOrg(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { orgId } = msg.body.orgId;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/'+ orgId +'/all_spaces/')
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
