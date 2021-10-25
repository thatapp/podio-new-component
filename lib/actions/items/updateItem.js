const Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function updateItem(msg, cfg) {
    const item = msg.body;
    const item_id = msg.body.item_id;

    if (!item_id) {
        throw new Error('Item_id field is required');
    }
    const podio = new Podio(cfg);

    let data = helper.fieldTransform(item, true);
    delete data["item_id"];

    const fields = {};

    // Checking if any of the data is null
    for (let property in data) {
        if (data[property] == null || data[property] == "null") {
            delete data[property];
        }
    }
    // fields.fields = data;
    delete data["appId"];
    fields.fields = data;

    const data_ = await podio.put('/item/' + item_id, fields);
    var result = { response: data_};
    await this.emit('data', messages.newMessageWithBody(result));
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
