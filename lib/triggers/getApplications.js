var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getApp(msg, cfg) {
    var that = this;
    var fields = msg.body;
    var podio = new Podio(cfg, this);
    podio.get('/app/'+ fields.app_id, {limit: 100})
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

            messages.emitSnapshot.call(that, apps);
            that.emit('data', messages.newMessageWithBody(apps));
        })
        .fail(messages.emitEnd.bind(this))
        .done();
};


