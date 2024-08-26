var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function getOrgTagsSearch(msg, cfg) {
  const that = this;
  const action = "Get Objects on Organization With Tag";
  this.logger.info(`"${action}" action started...`);

  var podio = new Podio(cfg);
  const { org_id, text } = msg.body;

  if (!org_id) {
    throw new Error('org_id field is required');
  }

  const response = await podio.get(`/tag/org/${org_id}/search/` , {text: text})
    .fail((err) => {
      this.logger.info(`"${action}" action errored...`);
      that.emit('error', err);
    });
  
  this.logger.info(`"${action}" action completed...`);
  that.emit('data', messages.newMessageWithBody(response));

}
