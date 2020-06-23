const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const _ = require('lodash');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const {SpaceId} = msg.body;

    if (!SpaceId) {
        throw new Error('Space Id field is required');
    }
    const space = await podio.get('/space/' + SpaceId).fail(messages.emitError.bind(that));
    console.log("Result" + JSON.stringify(space));

    if (cfg.splitResult && Array.isArray(space)) {
        for (const i_item of space) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(space));
    }
}


