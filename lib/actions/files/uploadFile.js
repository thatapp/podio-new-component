var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg,) {
    var that = this;
    try {
        var podio = new Podio(cfg);
        const { source, filename } = cfg;

        if (!filename) {
            throw new Error('filename field is required');
        }
        if (!source) {
            throw new Error('source field is required');
        }
        var url = '/file';
        var payload = {
            source,
            filename
        }

        const file = await podio.post(url, payload);
        await that.emit('data', messages.newMessageWithBody(file));
    } catch (error) {
        await that.emit('data', messages.newMessageWithBody(error));
    }
}


