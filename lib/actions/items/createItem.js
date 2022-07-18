const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const _ = require('lodash');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function createItem(msg, cfg) {
    try {
        const item = msg.body;
        const podio = new Podio(cfg);

        console.log(JSON.stringify(item));
        if (item.link.embed) {
            console.log("[URL]", item.link.embed);
            const data = {
                url: item.link.embed
            };
            const response = await podio.post('/embed/', data);
            console.log("[BODY]", response.body, response.body.embed_id);
            console.log(response, response.body);
            // item.link.embed = resolvedUrl.embed_id
        }
        
        const data = helper.fieldTransform(item);
        const fields = {};
        fields.fields = data;
        const items = await podio.post('/item/app/' + cfg.appId, fields);
        await this.emit('data', messages.newMessageWithBody(items));
    } catch (error) {
        console.log(error);
    }
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