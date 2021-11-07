const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getSpaceCalendar(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { space_id, date_from, date_to, priority, tasks } = msg.body;

    var fields = {};
    if(fields.date_from){
        fields.date_from = date_from;
    }
    if(fields.date_to){
        fields.date_to = date_to;
    }
    if(fields.priority){
        fields.priority = priority;
    }
    if(fields.tasks){
        fields.tasks = tasks;
    }

    if (!space_id) {
        throw new Error('Space ID field is required');
    }

    const spaceCalendar = await podio.get(`/calendar/space/${space_id}/`, fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,spaceCalendar,that);
};