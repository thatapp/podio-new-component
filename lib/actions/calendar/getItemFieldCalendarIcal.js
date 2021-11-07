const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getItemFieldCalendarIcal(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { item_id, field_id } = msg.body;

    if (!item_id) {
        throw new Error('Item_ID field is required');
    }
    if (!field_id) {
        throw new Error('Field_ID field is required');
    }

    const itemFieldCalendarIcal = await podio.get(`/calendar/item/${item_id}/field/${field_id}/ics/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,itemFieldCalendarIcal,that);
};