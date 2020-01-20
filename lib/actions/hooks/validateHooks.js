var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function validateHooks(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var fields = {};
    fields.hook_id = data.hook_id;

    podio.post('/hook/'+ data.hook_id +'/verify/validate',fields)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

