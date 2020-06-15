var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getItem(msg, cfg) {
    var fields = msg.body;
    var that = this;
    var podio = new Podio(cfg, this);
    await podio.get('/space/top/' + fields.org_id , {limit: 100})
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

            messages.emitSnapshot.call(that, spaces);
            that.emit('data', messages.newMessageWithBody(spaces));
        })
        .fail(messages.emitError.bind(this))
        .done();



};


