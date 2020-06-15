var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getItem(msg, cfg) {
    var that = this;
    var fields = msg.body;
    var podio = new Podio(cfg, this);
    await podio.get('/org/' + fields.org_id )
        .then((orgs) => {
            if (!_.isArray(orgs)) {
                return cb(new Error('Unable to retrieve Orgs'));
            }

            function transform(result, org){
                result[org.org_id] = org.name;
            }

            orgs = _(orgs)
                .transform(transform, {})
                .value();

            messages.emitSnapshot.call(that, orgs);
            that.emit('data', messages.newMessageWithBody(orgs));
        })
        .fail(messages.emitError.bind(this))
        .done();

};


