var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function deleteTags(msg, cfg) {
  const that = this;
  var podio = new Podio(cfg);
  this.logger.info('"Delete tags" action started...');
  const { ref_type, ref_id, text } = msg.body;

  if (!ref_type) {
    throw new Error('ref_type field is required');
  }

  if (!ref_id) {
    throw new Error('ref_d field is required');
  }

  if (!text) {
    throw new Error('tag field is required');
  }

  await podio.delete(`/tag/${ref_type}/${ref_id}?text=${text.trim() }`)
    .fail((err) => {
      this.logger.info('"Delete tags" action errored...');
      that.emit('error', err);
    });

  this.logger.info('"Delete tags" action completed...');
  that.emit('data', messages.newMessageWithBody(""));

}
