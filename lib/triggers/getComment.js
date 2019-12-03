var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = processTrigger;

function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { CommentId } = cfg;

    if (!CommentId) {
        throw new Error('Comment_id field is required');
      }
    
    podio.get('/comment/' + CommentId)
        .then(handleComment)
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));


    function handleComment(comment) {
        messages.emitSnapshot.call(that, comment);
    };

    
}


