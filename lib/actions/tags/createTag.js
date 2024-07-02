var Podio = require('../../../podio');
const { messages } = require('elasticio-node');

exports.process = async function createTag(msg, cfg) {

  var that = this;
  try {
    var podio = new Podio(cfg);
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
    const comments = await podio.post(`/comment/${type}/${id}`, tagArray);
    await that.emit('data', messages.newMessageWithBody(comments));
  } catch (error) {
    await that.emit('data', messages.newMessageWithBody(error));
  }
}