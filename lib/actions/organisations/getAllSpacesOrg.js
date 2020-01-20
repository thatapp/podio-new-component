var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getOrg(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    const { orgId } = msg.body.orgId;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/'+ orgId +'/all_spaces/')
        .then(function(org){
            messages.emitSnapshot.call(that, org);
            that.emit('data', messages.newMessageWithBody(org));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}
