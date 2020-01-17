var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function searchApp(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var item = msg.body;

    var fields = {};
    fields.app_id = parseInt(cfg.appId);
    if(item.counts) {
        fields.counts = (item.counts == "true") ? true : false;
    }
    if(item.highlights) {
        fields.highlights = (item.highlights == "true") ? true : false;
    }
    if(item.limit) {
        fields.limit = item.limit;
    }

    if(item.offset) {
        fields.offset = item.offset;
    }
    if(item.query) {
        fields.query = item.query;
    }
    if(item.ref_type) {
        fields.ref_type = item.ref_type;
    }
    if(item.search_fields) {
        fields.ref_type = item.search_fields;
    }

    podio.get('/search/app/'+ item.appId +'/v2',fields)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

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
exports.applications = async function getApplication(cfg) {
    var podio = new Podio(cfg, this);

    var apps = await podio.get('/app/space/' + cfg.spaceId);

    var result = {};
    apps.forEach(function (value, key) {
        if (value.status === "active") {
            result[value.app_id] = value.config.name;
        }
    });
    return JSON.parse(JSON.stringify(result));
};
