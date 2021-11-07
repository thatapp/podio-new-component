const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getSpaceCalendarIcal(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { space_id, user_id, token, tasks } = msg.body;

    var fields = {};
    if(fields.tasks){
        fields.tasks = tasks;
    }

    if (!space_id) {
        throw new Error('Space ID field is required');
    }
    if (!user_id) {
        throw new Error('User ID field is required');
    }
    if (!token) {
        throw new Error('Token field is required');
    }

    const app = await podio.get(`/calendar/space/${space_id}/ics/${user_id}/${token}/`, fields).fail(messages.emitError.bind(that));

    helper.emitData(cfg,app,that);
};