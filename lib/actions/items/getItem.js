const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const {messages} = require('elasticio-node');

exports.process =  async function getItem(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { ItemId } = msg.body;

    if (!ItemId) {
        throw new Error('Item_id field is required');
      }
    
     podio.get('/item/' + ItemId)
         .then(function(item){
             if (cfg.splitResult && Array.isArray(item)) {
                 for (const i_item of item) {
                     const output = messages.newMessageWithBody(i_item);
                     e.emit('data', output);
                 }
                 e.emit('end');
             } else {
                 e.emit('data', messages.newMessageWithBody(item));
             }
         })
         .fail(e.handleFailed(this))
         .done(e.handleDone(this));

};


