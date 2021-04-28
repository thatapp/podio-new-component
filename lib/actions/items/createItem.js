const Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const _ = require('lodash');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function createItem(msg, cfg) {
    const that = this;
   const item = msg.body;

   console.log(JSON.stringify(item));

    const podio = new Podio(cfg);
    const data = helper.fieldTransform(item);
    const fields = {};
    fields.fields = data;
   const items = await podio.post('/item/app/' + cfg.appId, fields);
   console.log(items);
    that.emit('data', messages.newMessageWithBody({items}));
   return items;
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    const podio = new Podio(cfg, this);
    podio.get('/app/' + cfg.appId)
        .then(getSchema)
        .fail(cb)
        .done();

    function getSchema(app) {
        let itemProperties = {
            external_id: {
                type: 'string',
                required: false,
                title: 'External ID'
            }
        };
        return helper.proccessAll(app, helper, itemProperties, cb, outScheme);
    }
};