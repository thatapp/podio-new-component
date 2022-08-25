const helper = require('../../../helpers/itemHelper');
const axios = require('axios');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    let that = this;
    const {FileId, ThatAppUserId, rawData} = msg.body;


    if (!FileId) {
        throw new Error('File_id field is required');
    }

    if (!ThatAppUserId) {
        throw new Error('ThatApp User Id field is required');
    }

    console.log(cfg.oauth);
    axios.post('https://workflow.thatapp.io/get/actual/files', {
        refresh_token: cfg.oauth.refresh_token,
        access_token: cfg.oauth.access_token,
        file_id: FileId,
        raw_data: rawData,
        thatapp_user_id: ThatAppUserId
    }).then(function (response) {
        helper.emitData(cfg, response.data, that);
    }).catch(function (error) {
        helper.emitData(cfg, error, that);
    });
}


