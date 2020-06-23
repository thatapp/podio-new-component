var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { FileId } =  msg.body;;

    if (!FileId) {
        throw new Error('File_id field is required');
      }

    const files = await podio.get('/file/' + FileId).fail(messages.emitError.bind(that));

    if (cfg.splitResult && Array.isArray(files)) {
        for (const i_item of files) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(files));
    }
    
}


