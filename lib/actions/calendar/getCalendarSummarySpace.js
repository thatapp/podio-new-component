var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function getCalendarSummarySpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);


    var fields = {};
    if(fields.priority){
        fields.priority = item.priority;
    }
    if(fields.limit){
        fields.limit = item.limit;
    }


    var calendarSummary = await podio.get(`/calendar/space/${item.space_id}/summary`, fields).fail(messages.emitError.bind(that));
    helper.emitData(cfg,calendarSummary,that);
};

