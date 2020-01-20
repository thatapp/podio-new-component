var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function createHooks(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var fields = {};
    fields.ref_type = data.ref_type;
    fields.ref_id = data.ref_id;



    podio.post('/hook/' + data.ref_type + "/" + data.ref_id,fields)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

