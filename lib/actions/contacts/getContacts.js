var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);

    const contact = await podio.get('/contact/').fail(messages.emitError.bind(that));

    helper.emitData(cfg,contact,that);

}
