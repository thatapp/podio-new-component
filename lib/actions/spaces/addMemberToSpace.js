const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function addMemberToSpace(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    let fields = {};
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
            e.emit(that, app);
        })
        .fail(e.handleFailed(this))
        .done(e.handleDone(this));

}

