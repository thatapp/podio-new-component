var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function getAppTags(msg, cfg) {
  const that = this;
  const action = "Get App Tags";
  this.logger.info(`"${action}" action started...`);

  var podio = new Podio(cfg);
  const { app_id, limit, text } = msg.body;

  if (!app_id) {
    throw new Error('app_id field is required');
  }

  const response = await podio.get(`/tag/app/${app_id}/` , {limit: limit, text: text})
    .fail((err) => {
      this.logger.info(`"${action}" action errored...`);
      that.emit('error', err);
    });
  
  this.logger.info(`"${action}" action completed...`);
  that.emit('data', messages.newMessageWithBody(response));

}
