const helper = require('../../../helpers/itemHelper');
const axios = require('axios');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    let that = this;
    const {FileId, rawData} = msg.body;


    if (!FileId) {
        throw new Error('File_id field is required');
    }

    axios.post('https://workflow.thatapp.io/get/actual/files', {
        refresh_token: cfg.oauth.refresh_token,
        access_token: cfg.oauth.access_token,
        file_id: FileId,
        raw_data: rawData
    }).then(function (response) {
        helper.emitData(cfg, response.data, that);
    }).catch(function (error) {
        helper.emitData(cfg, error, that);
        });
}


