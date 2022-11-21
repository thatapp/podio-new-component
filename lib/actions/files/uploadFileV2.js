var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const axios = require('axios');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    let that = this;
    const url = 'https://api.podio.com/file';
    try {

        const { source, filename } = cfg;

        if (!filename) {
            throw new Error('filename field is required');
        }
        if (!source) {
            throw new Error('source field is required');
        }
        var payload = {
            source,
            filename
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `OAuth2 ${cfg.oauth.access_token}`
            }
        }

        const file = await axios.post(url, payload, config);
        await that.emit('data', messages.newMessageWithBody(file));
    } catch (error) {
        await that.emit('data', messages.newMessageWithBody(error));
    }
}



