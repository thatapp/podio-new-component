var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = async function getOrganisations(msg, cfg) {
    var that = this;
    var fields = msg.body;
    var podio = new Podio(cfg, this);

    function transform(result, org){
        result[org.org_id] = org.name;
    }

    try {
        let orgs = await podio.get('/org/' + fields.org_id);
        if (!_.isArray(orgs)) {
            // Previous code called `cb(new Error(...))` — cb is undefined.
            // Also: /org/{id} returns a single org OBJECT, not an array. This
            // trigger needs a structural review — probably intended to fetch
            // the user's org list via `/org/` (no id) for polling.
            throw new Error('Unable to retrieve Orgs');
        }
        orgs = _(orgs).transform(transform, {}).value();
        messages.emitSnapshot.call(that, orgs);
        await that.emit('data', messages.newMessageWithBody(orgs));
    } catch (err) {
        that.emit('error', err);
    }
};


