const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getGlobalCalendarIcal(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { user_id, token, tasks } = msg.body;

    var fields = {};
    if(fields.tasks){
        fields.tasks = tasks;
    }

    if (!user_id) {
        throw new Error('User ID field is required');
    }
    if (!token) {
        throw new Error('Token field is required');
    }

    const globalCalendar = await podio.get(`/calendar/ics/${user_id}/${token}`, fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,globalCalendar,that);
};