var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function getTopApps(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);


    var fields = {};
    if(fields.exclude_demo){
        fields.exclude_demo = item.exclude_demo;
    }
    if(fields.limit){
        fields.limit = item.limit;
    }


    var items = await podio.get('/app/top/', fields).fail(messages.emitError.bind(that));
    helper.emitData(cfg,items,that);
};

