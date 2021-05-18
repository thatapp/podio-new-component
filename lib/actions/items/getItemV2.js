const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getItem(msg, cfg) {
    console.log(JSON.stringify(cfg));
    const that = this;
    const podio = new Podio(cfg);
    const { ItemId } = msg.body;

    if (!ItemId) {
        throw new Error('Item_id field is required');
      }

    const items = await podio.get('/item/' + msg.body.ItemId+ '/value/v2',null,msg.body.headers).fail(messages.emitError.bind(that));

    helper.emitData(cfg,items,that);
};


