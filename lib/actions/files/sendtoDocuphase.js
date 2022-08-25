var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');
const axios = require("axios");

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    const { PodioItemId, UniqueId,FirstName,LastName,LocationRef,Agency,Files,DocuPhaseURL } =  msg.body;;

    if (!PodioItemId) {
        throw new Error('Item ID field is required');
    }
    if (!UniqueId) {
        throw new Error('Unique ID field is required');
    }
    if (!FirstName) {
        throw new Error('FirstName field is required');
    }
    if (!LastName) {
        throw new Error('Lastname field is required');
    }
    if (!LocationRef) {
        throw new Error('LocationRef field is required');
    }
    if (!Agency) {
        throw new Error('Agency field is required');
    }
    if (!Files) {
        throw new Error('File Array field is required');
    }
    if (!DocuPhaseURL) {
        throw new Error('Docuphase Url field is required');
    }

    axios.post('https://workflow.thatapp.io/docuphase', {
        refresh_token: cfg.oauth.refresh_token,
        access_token: cfg.oauth.access_token,
        item_id: PodioItemId,
        unique_id: UniqueId,
        first_name: FirstName,
        last_name: LastName,
        location_ref: LocationRef,
        agency: Agency,
        files: JSON.stringify(Files),
        url: DocuPhaseURL,
    }).then(function (response) {
        helper.emitData(cfg, response.data, that);
    }).catch(function (error) {
        helper.emitData(cfg, error, that);
    });
}


