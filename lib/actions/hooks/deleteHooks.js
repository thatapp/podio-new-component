const { messages } = require('elasticio-node');
const _ = require('lodash');
import {podioDelete} from "../../../helpers/podioEndpont";

exports.process =  async function deleteHooks(msg, cfg) {
    const that = this;
    const data = msg.body;

    podioDelete(cfg, data.hook_id)
        .then(function(app){
            messages.emitSnapshot.call(that, app);
            that.emit('data', messages.newMessageWithBody(app));
        })
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));

};