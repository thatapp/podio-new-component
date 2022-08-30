const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const _ = require('lodash');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function createItem(msg, cfg) {
    const that = this;
    try {
        let item = msg.body;
        const podio = new Podio(cfg);
        // console.log("BODY", item);
        // console.log("ALL", msg);
        var item_remodified = await reformData(item,podio);

        const data = helper.fieldTransform(item_remodified);
        for (const key of Object.keys(data)) {
            if ((typeof data[key] === "object")) {
                if (typeof data[key].start_date === '[]' || typeof data[key].start_date === [] ) {
                    data[key] = [];
                }
            }
            if(data[key].start_date !== "undefined"){
                var start_date = data[key].start_date;
                if(Array.isArray(start_date)) {
                    if (start_date.length == 0) {
                        data[key] = [];
                    }
                }else if(typeof start_date === 'string'){
                    if (start_date == "[]") {
                        data[key] = [];
                    }
                }

            }
        }



        console.log("DATA EDIT:", data);
        //check for the field with type Link
        const fields = {};
        fields.fields = data;
        console.log("FIELDS ", fields);
        const items = await podio.post('/item/app/' + cfg.appId, fields);
        await that.emit('data', messages.newMessageWithBody(items));
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