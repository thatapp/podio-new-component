var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process =  async function addMemberToSpace(msg, cfg) {
    var that = this;
    var podio = new Podio(cfg);
    var data = msg.body;

    var fields = {};
    if(data.role) {
        fields.role = data.role;
    }

    if(data.message) {
        fields.message = data.message;
    }
    if(data.users) {
        fields.users = data.users;
    }
    if(data.profiles) {
        fields.profiles = data.profiles;
    }
    if(data.mails) {
        fields.mails = data.mails;
    }
    if(data.context_ref_type) {
        fields.context_ref_type = data.context_ref_type;
    }
    if(data.context_ref_id) {
        fields.context_ref_id = parseInt(data.context_ref_id);
    }

    podio.post('/space/'+ data.space_id +'/member/' ,fields)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

}

