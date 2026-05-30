const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const {SpaceId} = msg.body;

    if (!SpaceId) {
        throw new Error('Space Id field is required');
    }
    try {
        const space = await podio.get('/space/' + SpaceId);
        helper.emitData(cfg, space, that);
    } catch (err) {
        that.emit('error', err);
    }
}


