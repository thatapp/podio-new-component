'use strict';
var API_URL = 'https://api.podio.com';
var request = require('request');
var Q = require('q');
var _ = require('lodash');
var oauthUtils = require('./helpers/oauth-utils.js');
var concatStream = require('concat-stream');

function Podio(cfg, context) {
    this.cfg = cfg;
    this.context = context;
}

Podio.prototype.request = function(method, path, params, formData) {
    var defered = Q.defer();
    var that = this;
    var requestParams = {
        method : method,
        baseUrl: API_URL,
        url : path,
        headers : {
            Authorization : 'OAuth2 ' + this.cfg.oauth.access_token
        },
        json: true
    };

    if (formData) {
        requestParams.formData = formData;
    }

    if (params) {
        if (method.toUpperCase() === 'GET') {
            requestParams.qs = params;
        } else {
            requestParams.body = params;
        }
    }

     request(requestParams, responseHandler);

    async function responseHandler(err, response, body) {
        if (err) {
            return defered.reject(err);
        }
        console.log('x-rate-limit-remaining:', response.headers['x-rate-limit-remaining']);
        if (401 === response.statusCode) {
            console.log('Podio: Trying to refresh token...');
           oauthUtils.refreshAppToken('podio', that.cfg, onTokenRefresh);

          //  updateToken(refreshedToken);
        } else if (response.statusCode >= 400) {
            if (_.isObject(body)) {
                err = new Error(body.error_description);
                _.extend(err, body);
            } else {
                err = new Error('Unknown error');
            }
            err.statusCode = response.statusCode;
            return defered.reject(err);
        } else {
            return defered.resolve(body);
        }
    }

    function onTokenRefresh(cfg) {
        that.cfg = cfg;
        console.log(cfg);
        updateToken(cfg);
        requestParams.headers.Authorization = 'OAuth2 ' + cfg.oauth.access_token;
        console.log('Making new request...');
        request(requestParams, responseHandler);
    }

    function updateToken(cfg) {
        if (!that.context || !that.context.request || !that.context.request.emit) return;
        that.context.request.emit('updateAccessToken', {
            accountId : cfg._account,
            oauth : cfg.oauth
        });
    }

    return defered.promise;
};

Podio.prototype.get = function(path, params) {
    return this.request('GET', path, params);
};

Podio.prototype.post = function(path, params, formData) {
    return this.request('POST', path, params, formData);
};

Podio.prototype.put = function(path, params) {
    return this.request('PUT', path, params);
};

Podio.prototype.delete = function(path, params) {
    return this.request('DELETE', path, params);
};

Podio.prototype.uploadFileFromStream = function(fileName, source) {
    var that = this;
    var deferred = Q.defer();

    source.on('error', deferred.reject);
    source.pipe(concatStream(gotFile));

    function gotFile(buffer) {
        var formData = {
            filename: fileName,
                source: {
                value:  buffer,
                    options: {
                    filename: fileName
                }
            }
        };

        deferred.resolve(that.post('/file/', null, formData));
    }

    return deferred.promise;
};

Podio.prototype.attachFile = function(fileId, refType, refId) {
    var params = {
        ref_type: refType,
        ref_id: refId
    };
    return this.post('/file/'+fileId+'/attach', params);
};

module.exports = Podio;
