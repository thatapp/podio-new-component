var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function getAppTagsFull(msg, cfg) {
  const that = this;
  const action = "Get Items Tagged in App and Space";
  this.logger.info(`"${action}" action started...`);

  var podio = new Podio(cfg);
  const { app_id } = msg.body;

  if (!app_id) {
    throw new Error('app_id field is required');
  }

  const response = await podio.get(`/tag/app/${app_id}/search/full`)
    .fail((err) => {
      this.logger.info(`"${action}" action errored...`);
      that.emit('error', err);
    });
  
  this.logger.info(`"${action}" action completed...`);
  that.emit('data', messages.newMessageWithBody(response));

}
