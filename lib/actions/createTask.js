var Podio = require('../../podio');
var messages = require('./../../../messages.js');
var moment = require('moment');

exports.process = processAction;

function processAction(msg, cfg) {
    var that = this;
    var task = msg.body;
    var podio = new Podio(cfg);

    if (task.due_date) {
        task.due_date = moment(task.due_date).format('YYYY-MM-DD');
    }

    if (task.reminder && task.reminder.remind_delta) {
        task.reminder.remind_delta = Number(task.reminder.remind_delta);
    }

    podio.post('/task', task)
        .then(emit)
        .fail(onError)
        .done(this.emit.bind(this, 'end'));

    function emit(data) {
        that.emit('data', messages.newMessageWithBody(data));
    }

    function onError(e) {
        if (e.error === 'rate_limit') {
            that.emit('rebound', e);
        } else {
            that.emit('error', e);
        }
    }
}