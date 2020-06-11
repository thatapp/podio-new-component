const { messages } = require('elasticio-node');

exports.emit = async (obj, data) => {
    await messages.emitSnapshot.call(obj, data);
    that.emit('data', messages.newMessageWithBody(data));
};

exports.handleFailed = async (obj) => {
    messages.emitError.bind(obj)
};

exports.handleDone = async (obj) => {
    messages.emitEnd.bind(obj)
};