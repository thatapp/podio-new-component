var Q = require('q');
var _ = require('lodash');
var moment = require('moment');
var Podio = require('../../podio');
var s3client = require('s3');
var HeartBeatStream = require('heartbeat-stream').HeartBeatStream;
const { messages } = require('elasticio-node');


exports.process = async function createItem(msg, cfg) {

};
exports.getApplications = function getApplication(cfg, cb) {
    var podio = new Podio(cfg, this);

     podio.get('/app/', {limit: 100})
        .then((apps) => {
            if (!_.isArray(apps)) {
                return cfg(new Error('Unable to retrieve apps'));
            }

            function isActive(app){
                return 'active' === app.status;
            }

            function transform(result, app){
                result[app.app_id] = app.config.name;
            }

            apps = _(apps)
                .filter(isActive)
                .transform(transform, {})
                .value();

            return cb(null, apps);
        })
        .fail(err => {
            console.log('Error occurred', err.stack || err);
            cb(err , {verified: false});
        })
        .done();

};
exports.getSpaces = async function getSpaces(cfg, cb) {
    var podio = new Podio(cfg, this);
    await podio.get('/space/top/', {limit: 100})
        .then((spaces) => {
            if (!_.isArray(spaces)) {
                return cb(new Error('Unable to retrieve spaces'));
            }

            function transform(result, space){
                result[space.space_id] = space.name;
            }

            spaces = _(spaces)
                .transform(transform, {})
                .value();

            return cb(null, spaces);
        })
        .fail(onFail)
        .done();



    function onFail(err) {
        return cb(err);
    }
};
exports.getOrganisations = async function getOrganisations(cfg, cb) {
    var podio = new Podio(cfg, this);
    await podio.get('/org/')
        .then(function(orgs) {
            if (!_.isArray(orgs)) {
                return cb(new Error('Unable to retrieve organisations'));
            }

            function transform(result, org){
                result[org.org_id] = org.name;
            }

            orgs = _(orgs)
                .transform(transform, {})
                .value();
            // return cb(null, orgs);
           this.emit('data', messages.newMessageWithBody(orgs));
            //return orgs;
        })
        .fail(err => {
            console.log('Error occurred', err.stack || err);
            //cb(err , {verified: false});
        })
        .done();



    function onFail(err) {
        return cb(err);
    }
};

