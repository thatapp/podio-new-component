const Podio = require('../../../podio');
const {messages} = require('elasticio-node');

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

    do{
        offset = i * increment;
        fields.limit = increment;
        fields.offset = offset;
        const items = await podio.post('/item/app/' + item.app_id + '/filter/', fields);
        const count = items.items.length;
        items_data.push(items.items);
        i++;
    }while(count == increment);

    if (cfg.splitResult && Array.isArray(items_data)) {

        for (const i_item of result) {
            const output = messages.newMessageWithBody(i_item);
            // eslint-disable-next-line no-await-in-loop
            await emitter.emit('data', output);
        }
        await emitter.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(items_data));
    }

};

