var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg) {
    const that = this;
    const action = "Copy File";
    this.logger.info(`"${action}" action started...`);

    var podio = new Podio(cfg);
    const { file_id } = msg.body;

    if (!file_id) {
        throw new Error('file_id field is required');
    }

    const response = await podio.post(`/file/${file_id}/copy`)
        .fail((err) => {
            this.logger.info(`"${action}" action errored...`);
            that.emit('error', err);
        });

    this.logger.info(`"${action}" action completed...`);
    that.emit('data', messages.newMessageWithBody(response));
}


