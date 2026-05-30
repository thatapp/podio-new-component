var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { CommentId } =  msg.body;

    if (!CommentId) {
        throw new Error('Comment_id field is required');
      }

    try {
        await podio.delete('/comment/' + CommentId);
        helper.emitData(cfg, { message: "Comment Deleted Successfully" }, that);
    } catch (err) {
        that.emit('error', err);
    }
}


