var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { CommentId, data } =  msg.body;

    if (!CommentId) {
        throw new Error('Comment_id field is required');
      }

    try {
        const comments = await podio.put('/comment/' + CommentId, data);
        helper.emitData(cfg, comments, that);
    } catch (err) {
        that.emit('error', err);
    }
}


