var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
var _ = require('lodash');
const { messages } = require('elasticio-node');

exports.process = processTrigger;

function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { AppId } = cfg;

    if (!AppId) {
        throw new Error('App_id field is required');
      }
    
    podio.get('/app/' + AppId)
        .then(handleApp)
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));


    function handleApp(app) {
        messages.emitSnapshot.call(that, app);
    };

    
}


