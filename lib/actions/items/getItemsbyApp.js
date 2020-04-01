var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;



exports.process = async function getItemsbyApp(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);

    var offset = 0;
    var i = 0;
    var increment = 500;

    var items_data = [];
    var fields = item;
    console.log(JSON.stringify(fields));

    do{
         offset = i * increment;
        fields.limit = increment;
        fields.offset = offset;
        var items = await podio.post('/item/app/' + item.app_id + '/filter/', fields);
        var count = items.items.length;
        items_data.push(items.items);
        i++;
    }while(count == increment);


    that.emit('data', messages.newMessageWithBody(items_data));

    return items;
};

