const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getTaskCalendarIcal(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { task_id } = msg.body;

    if (!task_id) {
        throw new Error('Task_ID field is required');
    }

    const taskCalendar = await podio.get(`/calendar/task/${task_id}/ics/`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,taskCalendar,that);
};