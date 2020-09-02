/**
 * Common functionality for OAuth
 **/
var httpUtils = require('./http-utils.js');
var util = require('util');
var handlebars = require('hbs').handlebars;
var _ = require('lodash');

/**
 * This function refreshes OAuth token.
 *
 * @param serviceUri
 * @param clientIdKey
 * @param clientSecretKey
 * @param conf
 * @param next
 */
async function refreshToken(serviceUri, clientIdKey, clientSecretKey,credentials, conf, next) {
    // 'use strict';


     var clientId = getValueFromEnv(clientIdKey);
     var clientSecret = getValueFromEnv(clientSecretKey);

    // var refreshURI = resolveVars(serviceUri, conf);
    // var refreshURI = "https://thatapp-api.thatapp.io/api/update/token";
    //
    var params = {
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: conf.oauth ? conf.oauth.refresh_token : null,
        user_id: conf.oauth && typeof conf.oauth.ref != "undefined" ? conf.oauth.ref.id: null,
        email: credentials.email ? credentials.email : null,
        format: "json"
    };

    console.log("Calling Refresh Token");

    var newConf = _.cloneDeep(conf);

   await httpUtils.getJSON({
        url: refreshURI,
        method: "post",
        form: params
    }, function processResponse(err, refreshResponse) {
        if (err) {
            console.error('Failed to refresh token from %s', serviceUri);
            return next(err);
        }
        console.log('Refreshed token from %s', serviceUri);
        // update access token in configuration
       if(refreshResponse.access_token) {
           newConf.oauth.access_token = refreshResponse.access_token;
           // if new refresh_token returned, update that also
           // specification is here http://tools.ietf.org/html/rfc6749#page-47
           if (refreshResponse.refresh_token) {
               newConf.oauth.refresh_token = refreshResponse.refresh_token;
           }
       }else{
           console.log('Cannot Generate token, kindly reverify, to apply new changes');
           var er = "Cannot Generate token, kindly reverify, to apply new changes";
           return next(er);
       }
        console.log(newConf);
       next(newConf);
      //  return newConf;
    });



}

function getValueFromEnv(key) {
    var compiled = handlebars.compile(key);
    var value = compiled(process.env);
    if (value) {
        return value;
    }
    throw new Error(util.format("No value is defined for environment variable: '%s'", key));
}

function refreshAppToken(app, conf, cb) {
    var appDef = require('../component.json');
    var credentials = appDef.credentials || {};
    var oauth2 = credentials["oauth2"];
    refreshToken(
        oauth2['token_uri'],
        oauth2['client_id'],
        oauth2['client_secret'],
        credentials,
        conf,
        cb);
}

/**
 * This function resolves the variables in the string using hanlebars
 *
 * @param template
 * @param context
 * @returns {*}
 */
function resolveVars(template, context) {
    var compiled = handlebars.compile(template);
    return compiled(context);
}

exports.refreshToken = refreshToken;
exports.getValueFromEnv = getValueFromEnv;
exports.refreshAppToken = refreshAppToken;
