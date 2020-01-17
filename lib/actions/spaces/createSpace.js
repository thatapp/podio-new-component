var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const {messages} = require('elasticio-node');

exports.process = async function createSpace(msg, cfg) {
    var that = this;
    var item = msg.body;
    var podio = new Podio(cfg);
    console.log(JSON.stringify(item));

    var fields = {};
    fields.org_id = cfg.orgId;
    if(item.privacy) {
        fields.privacy = item.privacy;
    }
    fields.auto_join = (item.auto_join == "true") ? true: false;
    fields.name = item.name;
    fields.post_on_new_app = (item.post_on_new_app == "true") ? true: false;
    fields.post_on_new_member = (item.post_on_new_member == "true") ? true : false;



    var items = await podio.post('/space/', fields);

    that.emit('data', messages.newMessageWithBody(items));

    return items;

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
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
        var schema;
        var itemProperties = {
            name: {
                type: 'string',
                label: "Space Name",
                required: true,
                placeholder:"Enter space name"
            },
            privacy: {
                viewClass: "SelectView",
                prompt: "Privacy",
                label: "Privacy",
                required: true,
                model: {
                    open: "open",
                    closed: "closed"
                }
            },
            auto_join: {
                viewClass: "SelectView",
                prompt: "Auto Join",
                label: "Auto Join (new employees should be joined automatically)",
                model: {
                    true: "true",
                    false: "false"
                }
            },
            post_on_new_app: {
                viewClass: "SelectView",
                prompt: "New App",
                label: "New App Notification (if new apps should be announced with a status update)",
                model: {
                    true: "true",
                    false: "false"
                }
            },
            post_on_new_member: {
                viewClass: "SelectView",
                prompt: "New Member",
                label: "New member Notification (if new members should be announced with a status update)",
                model: {
                    true: "true",
                    false: "false"
                }
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

