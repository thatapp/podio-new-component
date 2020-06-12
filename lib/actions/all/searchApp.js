var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");
const e = require("../../../helpers/elasticoHelper");

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

    podio.get('/search/app/'+ cfg.appId +'/v2',fields)
        .then(function(app){
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

}

exports.organisations = async function getOrganisations(cfg, cb) {
   return org.getOrganisations(cfg, cb);
};

exports.spaces = async function getSpaces(cfg, msg) {
    return space.getSpaces(cfg, msg);
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

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getCSPaceModel(cfg, cb);
};

