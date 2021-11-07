const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function updateCalendarEvent(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { uid } = msg.body;

    if (!uid) {
        throw new Error('Uid field is required');
    }

    const externalCalendarEvent = await podio.put(`/calendar/event/${uid}`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,externalCalendarEvent,that);
};