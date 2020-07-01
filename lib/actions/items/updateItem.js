const Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function updateItem(msg, cfg) {
    const that = this;
  //  const item = msg.body;
    const item_id = msg.body.item_id;
    
    if (!item_id) {
        throw new Error('Item_id field is required');
    }
    const podio = new Podio(cfg);
    const item = JSON.parse('{ "title": "Split array value", "item_id": 1456176277 }');

    const data = helper.fieldTransform(item, true);
    delete data["item_id"];
    const fields = {};
    fields.fields = data;

    var data_ = await podio.put('/item/' + item_id, fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,data_,that);
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    const podio = new Podio(cfg, this);
    podio.get('/app/' + cfg.appId)
        .then(getSchema)
        .fail(cb)
        .done();
       
    function getSchema(app) {
        let itemProperties = {
            item_id: {
                type: 'number',
                required: true,
                title: 'Item ID'
            }
        };
        return helper.proccessAll(app, helper, itemProperties, cb, outScheme);
    }
};