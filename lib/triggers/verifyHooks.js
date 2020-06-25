const Podio = require('../../podio');
const _ = require('lodash');
const e = require("../../helpers/elasticoHelper");

exports.process =  async function verifyHooks(msg, cfg) {
    this.logger.info('Received new message:\n', JSON.stringify(msg));
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;
    if (data) {
        const fields = {};
        fields.code = data.code;
        console.log(fields);

        podio.post('/hook/' + data.hook_id + '/verify/request', fields)
            .then(function (app) {
                e.emit(that, app);
            }).catch(error => console.log(error.message))
            .fail(e.handleFailed(this))
            .done(e.handleDone(this));
    }
    await this.emit('data', msg);
    this.logger.info('Data emitted');
};