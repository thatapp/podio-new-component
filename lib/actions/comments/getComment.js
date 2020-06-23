var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { CommentId } =  msg.body;

    if (!CommentId) {
        throw new Error('Comment_id field is required');
      }

    const comments = await podio.get('/comment/' + CommentId).fail(messages.emitError.bind(that));

    if (cfg.splitResult && Array.isArray(comments)) {
        for (const i_item of comments) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(comments));
    }


}


