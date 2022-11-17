const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function updateItem(msg, cfg) {
    const that = this;
    try {
        const item = msg.body;
        const item_id = msg.body.item_id;
        if (!item_id) {
            throw new Error('Item_id field is required');
        }
        const podio = new Podio(cfg);

        var item_remodified = await reformData(item, podio);

        let data = helper.fieldTransform(item_remodified, true);

        // for(const[key, value] of Object.entries(data.date)){
        //     console.log(`key: ${key}`);
        //     console.log(`value: ${value}`);
        //     if (value === "[]") {
        //         data.date = []
        //     }
        // }

        delete data["item_id"];

        const fields = {};

        // Checking if any of the data is null
        for (let property in data) {
            if (data[property] == null || data[property] == "null") {
                delete data[property];
            }

            if(data[property].start_date !== "undefined"){
                var start_date = data[property].start_date;
                if(Array.isArray(start_date)) {
                    if (start_date.length == 0) {
                        data[property] = [];
                    }
                }else if(typeof start_date === 'string'){
                    if (start_date == "[]") {
                        data[property] = [];
                    }
                }

            }
        }

        // fields.fields = data;
        delete data["appId"];
        fields.fields = data;
        var url = `/item/${item_id}?silent=${cfg.silent ? 1 : 0}&hook=${cfg.hook ? 1 : 0}`;

        const data_ = await podio.put(url, fields,options);
        var result = { response: data_ };
        await that.emit('data', messages.newMessageWithBody(result));
    } catch (error) {
        console.log(error);
        await that.emit('data', messages.newMessageWithBody(error));
    }

};


reformData = async function (item, podio) {
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
            item_id: {
                type: 'number',
                required: true,
                title: 'Item ID'
            }
        };
        return helper.proccessAll(app, helper, itemProperties, cb, outScheme);
    }
};
