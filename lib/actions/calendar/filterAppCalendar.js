const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function filterAppCalendar(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { app_id } = msg.body;

    if (!app_id) {
        throw new Error('App ID field is required');
    }

    const app = await podio.post(`/calendar/app/${app_id}/filter`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};