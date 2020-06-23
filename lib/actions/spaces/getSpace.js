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
    const space = await podio.get('/space/' + SpaceId).fail(messages.emitError.bind(that));

    helper.emitData(cfg,space,that);

}


