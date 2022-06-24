var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function searchApp(msg, cfg) {
    var podio = new Podio(cfg);
    var item = msg.body;

    var fields = {};
    fields.app_id = parseInt(item.app_id);
    if (item.counts) {
        fields.counts = (item.counts == "true") ? true : false;
    }
    if (item.highlights) {
        fields.highlights = (item.highlights == "true") ? true : false;
    }
    if (item.limit) {
        fields.limit = item.limit;
    }

    if (item.offset) {
        fields.offset = item.offset;
    }
    if (item.query) {
        fields.query = item.query;
    }
    if (item.ref_type) {
        fields.ref_type = item.ref_type;
    }
    if (item.search_fields) {
        fields.search_fields = item.search_fields;
    }

    var apps = await podio.get('/search/app/' + item.app_id + '/v2', fields);
    console.log(apps, "APPS");

    if (Array.isArray(apps)) {
        for (const i_item of apps) {
            console.log(i_item, "i_item");
            const output = messages.newMessageWithBody(i_item);
            console.log(output, "output");
            await that.emit('data', output);
        }

    } else {
        await this.emit('data', messages.newMessageWithBody(apps));
    }

}

exports.getMetaModel = function getMetaModel(cfg, cb) {
    return space.getCSPaceModel(cfg, cb);
};

