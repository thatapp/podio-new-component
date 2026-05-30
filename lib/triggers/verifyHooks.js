const Podio = require('../../podio');
const _ = require('lodash');
const e = require("../../helpers/elasticoHelper");

exports.process = async function verifyHooks(msg, cfg) {
    this.logger.info('Received new message');
    const that = this;
    const podio = new Podio(cfg);
    const data = msg.body;

    if (!data) {
        // Nothing to verify; emit end so the polling cycle completes cleanly.
        return that.emit('end');
    }

    const fields = { code: data.code };

    try {
        const app = await podio.post('/hook/' + data.hook_id + '/verify/validate', fields);
        await e.emit(that, app);
        that.emit('end');
    } catch (err) {
        // Previous chain used `.catch(error => console.log(error.message))` which
        // SWALLOWED errors and let the .fail handler still run, causing the
        // platform to receive ambiguous success/error/end signals. Try/catch
        // with a single 'error' emit is the canonical pattern.
        that.emit('error', err);
    }
};