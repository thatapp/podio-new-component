const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const org = require("../../../helpers/orgHelper");
const spaceHelper = require("../../../helpers/spaceHelper");

exports.process = async function createSpaceHook(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    // Support passthrough from msg.body, fall back to cfg
    const hookUrl = msg.body.url || cfg.url;
    const refId = msg.body.ref_id || cfg.ref_id;
    const types = msg.body.hook_type || cfg.hook_type;

    if (!hookUrl) {
        throw new Error('url is required');
    }
    if (!refId) {
        throw new Error('ref_id is required');
    }
    if (!types || !Array.isArray(types) || types.length === 0) {
        throw new Error('hook_type is required and must be an array');
    }

    const response = [];
    const endpoint = '/hook/space/' + refId;

    for (const type of types) {
        try {
            const res = await podio.post(endpoint, {
                url: hookUrl,
                type: type
            });
            response.push(res);
        } catch (error) {
            console.error('Failed to create space hook:', error.message || error);
            that.emit('error', error);
            return;
        }
    }

    helper.emitData(cfg, response, that);
};

exports.getHooks = function getHooks(cfg, cb) {
    const space = {
        'app.create': 'app.create',
        'contact.create': 'contact.create',
        'contact.delete': 'contact.delete',
        'contact.update': 'contact.update',
        'member.add': 'member.add',
        'member.remove': 'member.remove',
        'status.create': 'status.create',
        'status.update': 'status.update',
        'status.delete': 'status.delete',
        'task.create': 'task.create',
        'task.update': 'task.update'
    };

    return cb(null, space);
};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};

exports.spaces = async function getSpaces(cfg, msg) {
    return spaceHelper.getSpaces(cfg, msg);
};
