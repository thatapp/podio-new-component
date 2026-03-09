'use strict';

const helper = require('../../../helpers/itemHelper');
const axios = require('axios');

exports.process = async function getActualFile(msg, cfg) {
    const that = this;
    const { FileId, rawData } = msg.body;

    if (!FileId) {
        throw new Error('File_id field is required');
    }

    const response = await axios.post('https://workflow.thatapp.io/get/actual/files', {
        access_token: cfg.oauth.access_token,
        refresh_token: cfg.oauth.refresh_token,
        file_id: FileId,
        raw_data: rawData
    });

    if (response.data && response.data.status === false) {
        throw new Error(response.data.message || 'File download failed');
    }

    helper.emitData(cfg, response.data, that);
};
