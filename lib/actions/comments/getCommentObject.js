var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { type, id } =  msg.body;

    const comments = await podio.get(`/comment/${type}/${id}/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,comments,that);
}


