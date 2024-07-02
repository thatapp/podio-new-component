var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function createTag(msg, cfg) {

  var that = this;
  try {
    var podio = new Podio(cfg);
    this.logger.info('"Create tag" action started...');
    this.logger.info(msg.body);
    const { ref_type, ref_id, text } = msg.body;

    if (!ref_type) {
      throw new Error('ref_type field is required');
    }

    if (!ref_id) {
      throw new Error('ref_d field is required');
    }

    if (!text) {
      throw new Error('text field is required');
    }

    let tags = text;
    let tagArray = tags.split(',').map(tag => tag.trim());
    this.logger.info("preparing tag to create");
    this.logger.info(tagArray);
    const resp = await podio.post(`/tag/${ref_type}/${ref_id}`, tagArray);
    this.logger.info(resp);

    await that.emit('data', messages.newMessageWithBody(resp));
  } catch (error) {
    this.logger.info(error);
    await that.emit('data', messages.newMessageWithBody(error));
  }
}
