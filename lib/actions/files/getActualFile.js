const helper = require('../../../helpers/itemHelper');
const axios = require('axios');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    let that = this;
    const {FileId} = msg.body;


    if (!FileId) {
        throw new Error('File_id field is required');
    }

    axios.post('https://sync.thatapp.io/api/v2/get/actual/files', {
        refresh_token: cfg.oauth.refresh_token,
        access_token: cfg.oauth.access_token,
        file_id: FileId
    }).then(function (response) {
        helper.emitData(cfg, response, that);

    }).catch(function (error) {
        helper.emitData(cfg, error, that);
        });
}


