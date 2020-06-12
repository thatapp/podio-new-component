const Podio = require('../../../podio');
const {messages} = require('elasticio-node');
const _ = require('lodash');
const org = require("../../../helpers/orgHelper");

exports.process = async function getAppBySpace(msg, cfg) {
    const that = this;
    const item = msg.body;
    const space_id = cfg.space_id;
    const podio = new Podio(cfg);


    let fields = {};
    fields.space_id = space_id;

    if(item.include_inactive) {
        fields.include_inactive = (item.include_inactive == "true") ? true : false;
    }

    const items = await podio.get('/app/space/' + space_id, fields).fail(messages.emitError.bind(that));
    console.log("Result" + JSON.stringify(items));

    that.emit('data', messages.newMessageWithBody(items));

};
exports.spaces = async function getSpaces(cfg, msg) {
    //console.log(msg);
    //console.log("Make API Call");
    const podio = new Podio(cfg, this);
    const spaces = await podio.get('/space/org/' + cfg.orgId);

    let result = {};
    spaces.forEach(function (value, key) {
        result[value.space_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
    let schema;
    const itemProperties = {
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
};

