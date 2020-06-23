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

    const items = await podio.get('/item/' + ItemId).fail(messages.emitError.bind(that));

    if (cfg.splitResult && Array.isArray(items)) {
        for (const i_item of items) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(items));
    }



};


