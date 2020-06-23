var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { TaskId } = msg.body;

    if (!TaskId) {
        throw new Error('Task Id field is required');
      }

    const task = await podio.get('/task/' + TaskId).fail(messages.emitError.bind(that));
    helper.emitData(cfg,task,that);


}


