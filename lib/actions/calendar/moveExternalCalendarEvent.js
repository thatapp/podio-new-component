const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function moveExternalCalendarEvent(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { linked_account_id, uid } = msg.body;

    if (!linked_account_id) {
        throw new Error('Linked_Account_ID field is required');
    }
    if (!uid) {
        throw new Error('Uid field is required');
    }

    const externalCalendarEvent = await podio.post(`/calendar/linked_account/${linked_account_id}/event/${uid}/move`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,externalCalendarEvent,that);
};