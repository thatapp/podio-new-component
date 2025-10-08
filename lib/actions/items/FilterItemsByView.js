const Podio = require('../../../podio');
const { messages } = require('elasticio-node');

const helper = require('../../../helpers/itemHelper');
const { filter } = require('lodash');

exports.process = async function getItemsbyApp(msg, cfg) {
    const that = this;
    const item = msg.body;
    const podio = new Podio(cfg);

    let offset = 0;
    let i = 0;

    const increment = 400;

    const items_data = [];
    const fields = item;
    console.log(JSON.stringify(fields));

    let count;
    if (!item.limit) {
        //make the first call to know the total
        fields.limit = 400;
        //  /item/app/{app_id}/filter/{view_id}/
        fields.offset = 0;
        const items = await podio.post('/item/app/' + item.app_id + '/filter/' + item.view_id + '/', fields);
        total = items.total;
        var item_data_ = items.items;
        helper.emitData(cfg, item_data_, that, 1);
        //get the remaining
        if (total > 400) {

            stop = total / 400;

            for (i = 1; i < stop; i++) {
                offset = i * increment;
                fields.limit = increment;
                fields.offset = offset;
                const items = await podio.post('/item/app/' + item.app_id + '/filter/' + item.view_id + '/', fields);
                console.log(items);
                count = items.items.length;
                //split the data
                item_data_ = items.items;
                helper.emitData(cfg, item_data_, that, 1);
            }
        }

        // helper.emitData(cfg,items.items,that);

    } else {
        fields.limit = item.limit;
        const items = await podio.post('/item/app/' + item.app_id + '/filter/' + item.view_id + '/', fields);
        console.log(JSON.stringify(items));
        var item_data_ = items.items;
        item_data_.forEach(function (value) {
            items_data.push(value);
        });
        helper.emitData(cfg, items_data, that);
    }

};

