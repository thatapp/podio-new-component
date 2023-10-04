var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const axios = require('axios');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    let that = this;
    try {

        const { source, filename } = msg.body;

        var payload = {
            source, filename,
            refresh_token: cfg.oauth.refresh_token
        }

        console.log(payload);

        var uploadurl = 'https://thatapp-api.thatapp.io/api/v2/proxy/file';
        const file = await axios.post(uploadurl, payload);
        console.log(file.data);
        await that.emit('data', messages.newMessageWithBody(file.data));
    } catch (error) {
        console.log(error);
        await that.emit('data', messages.newMessageWithBody(error));
    }
}



