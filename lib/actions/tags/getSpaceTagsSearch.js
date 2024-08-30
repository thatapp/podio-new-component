var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function getSpaceTagsSearch(msg, cfg) {
  const that = this;
  const action = "Get Objects on Space With Tag";
  this.logger.info(`"${action}" action started...`);

  var podio = new Podio(cfg);
  const { space_id, text } = msg.body;

  if (!space_id) {
    throw new Error('space_id field is required');
  }

  const response = await podio.get(`/tag/space/${space_id}/search/` , {text: text})
    .fail((err) => {
      this.logger.info(`"${action}" action errored...`);
      that.emit('error', err);
    });
  
  this.logger.info(`"${action}" action completed...`);
  that.emit('data', messages.newMessageWithBody(response));

}
