const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function getItem(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { ItemId } = msg.body;

    if (!ItemId) {
        throw new Error('Item_id field is required');
      }
    
     podio.get('/item/' + ItemId)
         .then(function(item){
             e.emit(that, item);
         })
         .fail(e.handleFailed(this))
         .done(e.handleDone(this));

};


