var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = processTrigger;

function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { TaskId } = msg.body;

    if (!TaskId) {
        throw new Error('Task Id field is required');
      }
    
    podio.get('/task/' + TaskId)
        .then(handleTask)
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));


    function handleTask(task) {
        messages.emitSnapshot.call(that, task);
    };

    function asObject(v) {
        return {value: v};
    }
}


