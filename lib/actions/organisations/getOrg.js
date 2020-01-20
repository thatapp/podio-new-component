var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getOrg(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    const { orgId } = cfg.body;

    if (!orgId) {
        throw new Error('OrgID field is required');
    }

    podio.get('/org/' + orgId)
        .then(function(org){
            messages.emitSnapshot.call(that, org);
            that.emit('data', messages.newMessageWithBody(org));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

exports.organisations = async function getOrganisations(cfg, cb) {
    let that = this;
    var podio = new Podio(cfg, this);

    var orgs = await podio.get('/org/');

    var result = {};
    orgs.forEach(function (value, key) {
        result[value.org_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));

};


