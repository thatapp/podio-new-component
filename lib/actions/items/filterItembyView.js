const Podio = require('../../../podio');
const e = require("../../../helpers/elasticoHelper");
const helper = require('../../../helpers/itemHelper');

exports.process = async function getItemReferences(msg, cfg) {
    const podio = new Podio(cfg);

    var url = `/item/app/${cfg.appId}/filter/${cfg.viewID}/`;
    
    var data_sent = msg.body;
    const item = await podio.post(url,data_sent).fail(e.handleFailed(this));

    await this.emit('data', messages.newMessageWithBody(item));
    return item;
};


exports.getMetaModel = function getMetaModel(cfg, cb) {

        let itemProperties = {
            limit: {
                type: 'number',
                required: false,
                title: 'Limit'
            },
            offset: {
                type: 'number',
                required: false,
                title: 'Offset'
            },
            remember: {
                type: 'string',
                required: false,
                title: 'Remember'
            },
            sort_by: {
                type: 'string',
                required: false,
                title: 'Sort By'
            },
            sort_desc: {
                type: 'string',
                required: false,
                title: 'Sort Desc'
            },
        };
        outProperties = {};
        
        schema = {
            'in': {
                type: 'object',
                properties: itemProperties
            },
            'out': {
                type: 'object',
                properties: outProperties
            }
        };
    

        return cb(null, schema);

       

};
