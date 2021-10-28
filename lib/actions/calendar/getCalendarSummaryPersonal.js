var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function getCalendarSummaryPersonal(msg, cfg) {
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


    var calendarSummary = await podio.get('/calendar/personal/summary', fields).fail(messages.emitError.bind(that));
    helper.emitData(cfg,calendarSummary,that);
};

