var Podio = require('../../../podio');
const {messages} = require('elasticio-node');
var _ = require('lodash');


exports.process = async function getAppBySpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var space_id = cfg.space_id;
    var podio = new Podio(cfg);


    var fields = {};
    fields.space_id = space_id;

    if(item.include_inactive) {
        fields.include_inactive = (item.include_inactive == "true") ? true : false;
    }

    var items = await podio.get('/app/space/' + space_id, fields).fail(messages.emitError.bind(that));
    console.log("Result" + JSON.stringify(items));

    that.emit('data', messages.newMessageWithBody(items));

};
exports.spaces = async function getSpaces(cfg, msg) {
    //console.log(msg);
    //console.log("Make API Call");
    var podio = new Podio(cfg, this);
    var spaces = await podio.get('/space/org/' + cfg.orgId);

    var result = {};
    spaces.forEach(function (value, key) {
        result[value.space_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));


};
exports.organisations = async function getOrganisations(cfg, cb) {
    let that = this;
    var podio = new Podio(cfg, this);

    var orgs = await podio.get('/org/');

    var result = {};
    orgs.forEach(function (value, key) {
        result[value.org_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
    // cb(null, result)
    //return result;


};
exports.getMetaModel = function getMetaModel(cfg, cb) {
    var schema;
    var itemProperties = {
        include_inactive: {
            type: "string",
            label: "Include Inactive(true or false)"
        }
    };
    schema = {
        'in': {
            type: 'object',
            properties: itemProperties
        }
    };
    return cb(null, schema);
}


