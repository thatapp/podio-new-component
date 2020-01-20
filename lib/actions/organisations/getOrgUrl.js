var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getOrgUrl(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    const { url } = msg.body.url;

    if (!url) {
        throw new Error('URL field is required');
    }

    podio.get('/org/url')
        .then(function(org){
            messages.emitSnapshot.call(that, org);
            that.emit('data', messages.newMessageWithBody(org));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}



