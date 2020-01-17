var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;



exports.process = async function getMemberSpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);
    console.log(item);

    var fields = {};
    fields.space_id = item.spaceId;
    if(fields.limit){
        fields.limit = item.limit;
    }
    if(fields.member_type){
        fields.member_type = item.member_type;
    }
    if(fields.offset){
        fields.offset = item.offset;
    }
    if(fields.query){
        fields.query = item.query;
    }

    var members = await podio.get('/space/'+ item.spaceId +'/member/v2/' , fields);

    that.emit('data', messages.newMessageWithBody(members));

    return members;
};
exports.spaces = async function getSpaces(cfg, msg) {
    console.log(msg);
    console.log("Make API Call");
    var podio = new Podio(cfg, this);
    var spaces = await podio.get('/space/org/' + cfg.orgId);

    var result = {};
    spaces.forEach(function (value, key) {
        result[value.space_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));


};
exports.organisations = async function getOrganisations(cfg, cb) {
    let that = this;
    var podio = new Podio(cfg, this);

    var orgs = await podio.get('/org/');

    var result = {};
    orgs.forEach(function (value, key) {
        result[value.org_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
    // cb(null, result)
    //return result;


};
