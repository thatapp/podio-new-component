const Podio = require('../../../podio');
const _ = require('lodash');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');
const { messages } = require('elasticio-node');

exports.process = async function getUserStream(msg, cfg) {
    console.log(JSON.stringify(cfg));
    const that = this;
    const podio = new Podio(cfg);
    const { user_id } = msg.body;

    if (!user_id) {
        throw new Error('User_id field is required');
    }

    const user = await podio.get(`/stream/user/${user_id}/v3`)
        .fail((err) => {
            that.emit('data', messages.newMessageWithBody(err));
        });

    helper.emitData(cfg, user, that);
};


