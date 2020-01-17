var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getApp(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    const { AppId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }

    podio.get('/app/' + AppId)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

