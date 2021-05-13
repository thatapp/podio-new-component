'use strict';
var API_URL = 'https://api.podio.com';
var request = require('request');
var Q = require('q');
var _ = require('lodash');
var oauthUtils = require('./helpers/oauth-utils.js');
var concatStream = require('concat-stream');
const axios = require('axios');

function Podio(cfg, context) {
    this.cfg = cfg;
    this.context = context;
}

Podio.prototype.request = function(method, path, params, formData,headers) {
    var defered = Q.defer();
    var that = this;
    if(!headers){
        headers = {
            Authorization : 'OAuth2 ' + this.cfg.oauth.access_token
        };
    }
    var requestParams = {
        method : method,
        baseUrl: API_URL,
        url : path,
        headers : headers,
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
        try {
            console.log('x-rate-limit-remaining:', response.headers['x-rate-limit-remaining']);
        }catch (e) {

        }
        if (401 === response.statusCode) {
            //console.log('Podio: Trying to refresh token...');
           oauthUtils.refreshAppToken('podio', that.cfg, onTokenRefresh);

           // updateToken(refreshedToken);
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
        updateToken(cfg);
        requestParams.headers.Authorization = 'OAuth2 ' + cfg.oauth.access_token;
        console.log('Making new request...');
        request(requestParams, responseHandler);
    }

    async function updateToken(cfg) {
        console.log('Updating component credentials with new access token');
        var data = {
            data: {
                id: cfg._account,
                type: "credential",
                attributes: {
                    keys: {
                        oauth: cfg.oauth,
                    }
                },
            }
        };
       await axios.patch(`https://api.elastic.io/v2/credentials/${cfg._account}`, data).catch((errr) => {
           console.log(errr);
       });
        // that.context.request.emit('updateAccessToken', new_auth);
    }

    return defered.promise;
};

Podio.prototype.get = function(path, params,headers) {
    return this.request('GET', path, params,null,headers);
};

Podio.prototype.post = function(path, params, formData,headers) {
    return this.request('POST', path, params, formData,headers);
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
