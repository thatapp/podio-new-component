const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getItem(msg, cfg) {
    console.log(JSON.stringify(cfg));
    const that = this;
    const podio = new Podio(cfg);
    const { appId } = msg.body;

    if (!appId) {
        throw new Error('App Id field is required');
      }
      var url = `/item/app/${appId}/count`;
    const items = await podio.get(url)
        .fail((err) => {
            that.emit('data', messages.newMessageWithBody(err));
        });

    helper.emitData(cfg,items,that);
};


