var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');
const axios = require("axios");

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    const { fileURL, destination } =  msg.body;;

    if (!fileURL) {
        throw new Error('File_id field is required');
    }

    if (!destination) {
        throw new Error('Destination field is required');
    }
    axios.post('https://workflow.thatapp.io/move/haven', {
        refresh_token: cfg.oauth.refresh_token,
        access_token: cfg.oauth.access_token,
        file_url: fileURL,
        destination: destination
    }).then(function (response) {
        helper.emitData(cfg, response.data, that);
    }).catch(function (error) {
        helper.emitData(cfg, error, that);
    });
}


