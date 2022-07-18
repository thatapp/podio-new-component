
const helper = require('../../../helpers/itemHelper');

exports.process = async function getTokens(msg, cfg) {
    var that = this;
    var items = cfg;

    helper.emitData(cfg,items,that);

};

