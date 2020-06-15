var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function getItem(msg, cfg) {
    var fields = msg.body;
    var that = this;
    var podio = new Podio(cfg, this);

    await podio.get('/item/' + fields.item_id)
        .then((item) => {
            if (!_.isArray(item)) {
                return cb(new Error('Unable to retrieve Item'));
            }

            messages.emitSnapshot.call(that, item);
            that.emit('data', messages.newMessageWithBody(item));
        })
        .fail(messages.emitError.bind(this))
        .done();

};


