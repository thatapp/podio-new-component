var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    var that = this;
    try {
        var podio = new Podio(cfg);
        const { ref_id, ref_type, fileId } = cfg;
        const payload = {
            ref_id,
            ref_type
        }

        let url = `/file/${fileId}/attach`;

        const file = await podio.post(url, payload);
        await that.emit('data', messages.newMessageWithBody(file));
    } catch (error) {
        await that.emit('data', messages.newMessageWithBody(error));
    }
}


