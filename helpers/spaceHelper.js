const Podio = require('../podio');

exports.getMetaModel = function getMetaModel(cfg, cb) {
    let schema;
    const itemProperties = {
        name: {
            type: 'string',
            label: "Space Name",
            required: true,
            placeholder:"Enter space name"
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
    console.log("Make SPACE API Call");
    var podio = new Podio(cfg, this);
    var spaces = await podio.get('/space/org/' + cfg.orgId);

    var result = {};
    spaces.forEach(function (value, key) {
        result[value.space_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
};

exports.getApplication = async (cfg,msg) => {
    console.log(msg);
    console.log("Make APP API Call");
    var podio = new Podio(cfg, this);

    var apps = await podio.get('/app/space/' + cfg.spaceId);

    var result = {};

    apps.forEach(function (value, key) {
        if (value.status === "active") {
            result[value.app_id] = value.config.name;
        }
    });
    return JSON.parse(JSON.stringify(result));
};

exports.getFields = async (cfg,msg) => {
    console.log(msg);
    console.log("Make Field API Call");
    var podio = new Podio(cfg, this);

    var app = await podio.get('/app/' + cfg.appId);

    var result = {};

    var fields = app.fields;

    fields.forEach(function (value, key) {
        if (value.status === "active") {
            result[value.field_id] = value.label;
        }
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