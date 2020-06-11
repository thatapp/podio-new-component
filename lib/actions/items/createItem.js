const Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const _ = require('lodash');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

exports.process = async function createItem(msg, cfg) {
    const that = this;
    const item = msg.body;
  //  var item = JSON.parse('{"duration":2,"location":"650 Townsend St., San Francisco, CA 94103","progress":45,"money":{"currency":"USD","value":123},"number":45,"email":{"value":"williamnwogbo@gmail.com","type":"home"},"phone":{"value":"07039448968","type":"home"},"workspacecontacts":197795122,"contactspaceexternalmembers":68718029,"contactspacemembersonly":68718029,"relationshipmultiple":{"value":[1333494153,1330027948]},"relationshipsingle":{"value":1333494153},"date":"2019-02-03 23:59:59","categorymultiple":[1,2],"categorysingle":1,"textmultiline":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum","textsingleline":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"}');
    const podio = new Podio(cfg);
    const data = helper.fieldTransform(item);
    const fields = {};
    fields.fields = data;
    console.log(JSON.stringify(fields));
    const items = await podio.post('/item/app/' + cfg.appId, fields);
    that.emit('data', messages.newMessageWithBody(items));
   return items;
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    const podio = new Podio(cfg, this);
    podio.get('/app/' + cfg.appId)
        .then(getSchema)
        .fail(cb)
        .done();

    function getSchema(app) {
        let itemProperties = {
            external_id: {
                type: 'string',
                required: false,
                title: 'External ID'
            }
        };
        return helper.proccessAll(app, helper, itemProperties, cb, outScheme);
    }
};