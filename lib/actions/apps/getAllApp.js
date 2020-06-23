var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = async function getAllApp(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);


    var fields = {};
    if(fields.exclude_app_ids){
        fields.exclude_app_ids = item.exclude_app_ids;
    }
    if(fields.exclude_demo){
        fields.exclude_demo = item.exclude_demo;
    }
    if(fields.limit){
        fields.limit = item.limit;
    }
    if(fields.order){
        fields.order = item.order;
    }

    if(fields.referenceable_in_org){
        fields.referenceable_in_org = item.referenceable_in_org;
    }

    if(fields.target_space_id){
        fields.target_space_id = item.target_space_id;
    }

    if(fields.text){
        fields.text = item.text;
    }


    var items = await podio.get('/app/', fields).fail(messages.emitError.bind(that));
    helper.emitData(cfg,items,that);
};

