var Podio = require('../../podio');
var messages = require('./../../../messages.js');

exports.process = processAction;

function processAction(msg, cfg) {
    var org = msg.body;
    var podio = new Podio(cfg);

    podio.post('/org', org)
        .then(emit)
        .fail(this.emit.bind(this, 'error'))
        .done(this.emit.bind(this, 'end'));

    var that = this;
    
    function emit(data) {
        that.emit('data', messages.newMessageWithBody(data));
    }
}