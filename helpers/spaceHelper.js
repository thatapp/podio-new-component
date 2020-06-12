const Podio = require('../podio');

exports.getMetaModel = function getMetaModel(cfg, cb) {
    let schema;
    const itemProperties = {
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
};

exports.getSpaces = async (cfg, msg) => {
    console.log(msg);
    console.log("Make API Call");
    var podio = new Podio(cfg, this);
    var spaces = await podio.get('/space/org/' + cfg.orgId);

    var result = {};
    spaces.forEach(function (value, key) {
        result[value.space_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
};

exports.getCSPaceModel = (cfg, cb) => {
    let schema;
    const itemProperties = {
        counts: {
            type: "string",
            prompt: "Counts",
            label: "Counts(true,false)",

        },
        highlights: {
            type: "SelectView",
            label: "highlights(true,false)",
        },
        limit: {
            type: "number",
            label: "Limit",
            placeholder:"100"
        },
        offset: {
            type: "string",
            label: "Offset",
            placeholder:"0"
        },
        ref_type: {
            type: "string",
            prompt: "Ref Type",
            label: "Ref Type(item,task,file,conversation,profile,app)"
        },
        query: {
            type: "string",
            label: "query",
            placeholder:""
        },
        search_fields: {
            type: "string",
            label: "Search Fields",
            placeholder:""
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