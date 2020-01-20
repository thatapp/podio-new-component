var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function updateAppField(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var fields = {};
    fields.app_id = parseInt(data.appId);
    fields.field_id = parseInt(data.fieldId);



    podio.put('/app/' + data.appId + "/field/" + data.fieldId,fields)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

