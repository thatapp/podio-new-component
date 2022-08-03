const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const _ = require('lodash');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function createItem(msg, cfg) {
    try {
        let item = msg.body;
        const podio = new Podio(cfg);

        var item_remodified = await reformData(item,podio);

        const data = helper.fieldTransform(item_remodified);
        //check for the field with type Link
        const fields = {};
        fields.fields = data;
        const items = await podio.post('/item/app/' + cfg.appId, fields);
        await this.emit('data', messages.newMessageWithBody(items));
    } catch (error) {
        console.log(error);
        await that.emit('data', messages.newMessageWithBody(error));
    }
};

reformData = async function(item,podio) {
    for (const key of Object.keys(item)) {
        if ((typeof item[key] === "object")) {
            if (typeof item[key].embed !== 'undefined') {
                const data = {
                    url: item[key].embed
                };
                const resolvedUrl = await podio.post('/embed/', data);
                item[key].embed = resolvedUrl.embed_id
            }
        }
    }
    return item;
}

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