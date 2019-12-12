var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getItem(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg, this);
    await podio.get('/org/')
        .then((orgs) => {
            if (!_.isArray(orgs)) {
                return cb(new Error('Unable to retrieve Orgs'));
            }

            function transform(result, org){
                result[org.org_id] = org.name;
            }

            orgs = _(orgs)
                .transform(transform, {})
                .value();

            messages.emitSnapshot.call(that, orgs);
            that.emit('data', messages.newMessageWithBody(orgs));
        })
        .fail(messages.emitError.bind(this))
        .done();

};


