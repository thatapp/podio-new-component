var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const axios = require('axios');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    let that = this;
    try {

        const { url } = msg.body;
        var payload = {
            url,
            refresh_token: cfg.oauth.refresh_token
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `OAuth2 ${cfg.oauth.access_token}`
            }
        }
        var uploadurl = 'https://workflow.thatapp.io/upload/file';
        const file = await axios.post(uploadurl, payload, config);
        await that.emit('data', messages.newMessageWithBody(file));
    } catch (error) {
        await that.emit('data', messages.newMessageWithBody(error));
    }
}



