var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg,) {
    var that = this;
    try {
        var podio = new Podio(cfg);
        const { file_id } = msg.bosy;

        var url = ` /file/${file_id}/copy`;

        const file = await podio.post(url);
        await that.emit('data', messages.newMessageWithBody(file));
    } catch (error) {
        await that.emit('data', messages.newMessageWithBody(error));
    }
}


