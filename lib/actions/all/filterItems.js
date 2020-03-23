var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;



exports.process = async function filterItem(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);


    var fields = item;
    console.log(JSON.stringify(fields));

    var items = await podio.post('/item/app/' + item.app_id + '/filter/', fields);

    that.emit('data', messages.newMessageWithBody(items));

    return items;
};

