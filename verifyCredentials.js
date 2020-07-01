const Podio = require('../../../podio');
var httpUtils = require('./helpers/http-utils.js');
var oauth_helper = require('./helpers/oauth-utils');

module.exports =  async function verify(credentials, cb) {
   
    var refreshURI = "https://thatapp-api.thatapp.io/api/update/token";

    var clientId = oauth_helper.getValueFromEnv(clientIdKey);
    var clientSecret = oauth_helper.getValueFromEnv(clientSecretKey);


    var params = {
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: conf.oauth ? conf.oauth.refresh_token : null,
        user_id: conf.oauth ? conf.oauth.ref.id: null,
        email: credentials.email,
        format: "json"
    };

    console.log(params);

   await httpUtils.getJSON({
        url: refreshURI,
        method: "post",
        form: params
    }, function processResponse(err, refreshResponse) {
        if (err) {
            console.error('Failed to Store Information', serviceUri);
            return next(err);
        }
    });

    return cb(null, { verified: true });

};

