var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = async function getApp(msg, cfg) {
    var that = this;
    var fields = msg.body;
    var podio = new Podio(cfg, this);

    function isActive(app){
        return 'active' === app.status;
    }

    function transform(result, app){
        result[app.app_id] = app.config.name;
    }

    try {
        let apps = await podio.get('/app/' + fields.app_id, { limit: 100 });
        if (!_.isArray(apps)) {
            // Previous code called `cfg(new Error(...))` here, treating cfg as a
            // callback. cfg is an OBJECT — that line would throw TypeError instead
            // of emitting a structured error. Surface as a real error now.
            throw new Error('Unable to retrieve apps');
        }
        apps = _(apps).filter(isActive).transform(transform, {}).value();
        messages.emitSnapshot.call(that, apps);
        await that.emit('data', messages.newMessageWithBody(apps));
    } catch (err) {
        // Previously .fail(messages.emitEnd.bind(this)) — emitted 'end' on
        // failure, which signals "polling cycle complete, no errors" to the
        // platform. A polling trigger that emits 'end' on errors silently
        // succeeds while losing every record. Surface as 'error' instead.
        that.emit('error', err);
    }
};


