const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');


exports.process =  async function getItem(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { ItemId } = msg.body;

    if (!ItemId) {
        throw new Error('Item_id field is required');
      }

    const items = await podio.get('/item/' + ItemId).fail(messages.emitError.bind(that));

    helper.emitData(cfg,items,that);
};


