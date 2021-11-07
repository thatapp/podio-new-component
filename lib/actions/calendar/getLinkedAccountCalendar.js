const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getLinkedAccountCalendar(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { linked_account_id, date_from, date_to } = msg.body;

    var fields = {};
    if(fields.date_from){
        fields.date_from = date_from;
    }
    if(fields.date_to){
        fields.date_to = date_to;
    }

    if (!linked_account_id) {
        throw new Error('Linked_Account ID field is required');
    }

    const linkedAccountCalendar = await podio.get(`/calendar/linked_account/${linked_account_id}/`, fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,linkedAccountCalendar,that);
};