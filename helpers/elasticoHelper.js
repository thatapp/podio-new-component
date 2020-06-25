const { messages } = require('elasticio-node');

exports.emit = async (obj, data) => {
    await messages.emitSnapshot.call(obj, data);
    obj.emit('data', messages.newMessageWithBody(data));
};

exports.handleFailed = async (obj) => {
    try {
        messages.emitError.bind(obj)
    }catch (e) {
        console.log(obj);
    }
};

exports.handleDone = async (obj) => {
    messages.emitEnd.bind(obj)
};