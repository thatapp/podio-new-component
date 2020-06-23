const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");

exports.process =  async function getApp(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { AppId } = msg.body;

    if (!AppId) {
        throw new Error('App_id field is required');
    }
    const app = await podio.get('/app/' + AppId).fail(messages.emitError.bind(that));

    if (cfg.splitResult && Array.isArray(app)) {
        for (const i_item of app) {
            const output = messages.newMessageWithBody(i_item);
            that.emit('data', output);
        }
        that.emit('end');
    } else {
        that.emit('data', messages.newMessageWithBody(app));
    }
};