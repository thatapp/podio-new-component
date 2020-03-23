var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function deleteView(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    podio.delete('/view/' + data.view_id)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

