'use strict';
var Podio = require('./podio');
var _ = require('lodash');

function getApplications(cfg, cb) {
    var podio = new Podio(cfg, this);

    podio.get('/app/', {limit: 100})
        .then(format)
        .fail(onFail)
        .done();

    function format(apps) {
        if (!_.isArray(apps)) {
            return cb(new Error('Unable to retrieve apps'));
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
    }

    function onFail(err) {
        return cb(err);
    }
}

function getSpaces(cfg, cb) {
    var podio = new Podio(cfg, this);
    podio.get('/space/top/', {limit: 100})
        .then(format)
        .fail(onFail)
        .done();

    function format(spaces) {
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
    }

    function onFail(err) {
        return cb(err);
    }
}

exports.getSpaces = getSpaces;
exports.getApplications = getApplications;