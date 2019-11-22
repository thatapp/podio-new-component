var Podio = require('../../podio');
var messages = require('./../../../messages.js');

exports.process = processAction;

function processAction(msg, cfg) {
    var refType = msg.body.refType;
    var refId = msg.body.refId;
    var remindersDelta = Number(msg.body.remindersDelta);
    var podio = new Podio(cfg);

    podio.post('/reminder/' + refType + '/' + refId, {remind_delta: remindersDelta})
        .then(emit)
        .fail(this.emit.bind(this, 'error'))
        .done(this.emit.bind(this, 'end'));

    var that = this;
    
    function emit(data) {
        that.emit('data', messages.newMessageWithBody(data));
    }
}