const Podio = require('../../../podio');
const {messages} = require('elasticio-node');

const helper = require('../../../helpers/itemHelper');

exports.process = async function getItemsbyApp(msg, cfg) {
    const that = this;
    const item = msg.body;
    const podio = new Podio(cfg);

    let offset = 0;
    let i = 0;

    const increment = 500;

    const items_data = [];
    const fields = item;
    console.log(JSON.stringify(fields));
    let count;
    if(!item.limit) {
        do {
            offset = i * increment;
            fields.limit = increment;
            fields.offset = offset;
            const items = await podio.post('/item/app/' + item.app_id + '/filter/', fields);
            count = items.items.length;
            items_data.push(items.items);
            i++;
        } while (count == increment);
    }else{
        fields.limit = item.limit;
        const items = await podio.post('/item/app/' + item.app_id + '/filter/', fields);
        items_data.push(items)
    }
    helper.emitData(cfg,items_data,that);
};

