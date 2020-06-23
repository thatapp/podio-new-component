var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;

exports.process = async function getView(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);


    var fields = item;

    var items = await podio.get('/view/app/' + item.app_id + '/' + item.view_id_or_name);

    if (cfg.splitResult && Array.isArray(items)) {
        for (const i_item of items) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(items));
    }

    return items;
};

