var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

exports.process = processTrigger;

async function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { FileId } =  msg.body;;

    if (!FileId) {
        throw new Error('File_id field is required');
      }

    const files = await podio.get('/file/' + FileId).fail(messages.emitError.bind(that));

    helper.emitData(cfg,files,that);


}


