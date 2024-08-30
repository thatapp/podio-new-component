var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function getOrgTags(msg, cfg) {
  const that = this;
  const action = "Get Tags on Organization";
  this.logger.info(`"${action}" action started...`);

  var podio = new Podio(cfg);
  const { org_id, limit, text } = msg.body;

  if (!org_id) {
    throw new Error('org_id field is required');
  }

  const response = await podio.get(`/tag/org/${org_id}/` , {limit:limit, text: text})
    .fail((err) => {
      this.logger.info(`"${action}" action errored...`);
      that.emit('error', err);
    });
  
  this.logger.info(`"${action}" action completed...`);
  that.emit('data', messages.newMessageWithBody(response));

}
