const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getItem(msg, cfg) {
    console.log(JSON.stringify(cfg));
    const that = this;
    const podio = new Podio(cfg);
    const { itemID } = msg.body;

    if (!itemID) {
        throw new Error('Item_id field is required');
    }

    const items = await podio.get('/item/' + msg.body.itemID + "/clone",null,msg.body.headers)
        .fail((err) => {
            that.emit('data', messages.newMessageWithBody(err));
        });

    helper.emitData(cfg,items,that);
};


