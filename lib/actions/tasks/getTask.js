var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { TaskId } = msg.body;

    if (!TaskId) {
        throw new Error('Task Id field is required');
      }

    const task = await podio.get('/task/' + TaskId).fail(messages.emitError.bind(that));

    if (cfg.splitResult && Array.isArray(task)) {
        for (const i_item of task) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(task));
    }

}


