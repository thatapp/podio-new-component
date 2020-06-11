const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const _ = require('lodash');

exports.process =  async function getItem(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { ItemId } = msg.body;

    if (!ItemId) {
        throw new Error('Item_id field is required');
      }
    
     podio.get('/item/' + ItemId)
        .then(function(item){
            messages.emitSnapshot.call(that, item);
            that.emit('data', messages.newMessageWithBody(item));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

};


