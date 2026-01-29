const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const org = require("../../../helpers/orgHelper");
const space = require("../../../helpers/spaceHelper");

exports.process = async function createAppHook(msg, cfg) {
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
    const endpoint = '/hook/app/' + refId;

    for (const type of types) {
        try {
            const res = await podio.post(endpoint, {
                url: hookUrl,
                type: type
            });
            response.push(res);
        } catch (error) {
            console.error('Failed to create app hook:', error.message || error);
            that.emit('error', error);
            return;
        }
    }

    helper.emitData(cfg, response, that);
};

exports.getHooks = function getHooks(cfg, cb) {
    const app = {
        'app.delete': 'app.delete',
        'app.update': 'app.update',
        'comment.create': 'comment.create',
        'comment.delete': 'comment.delete',
        'file.change': 'file.change',
        'form.create': 'form.create',
        'form.delete': 'form.delete',
        'form.update': 'form.update',
        'item.create': 'item.create',
        'item.delete': 'item.delete',
        'item.update': 'item.update',
        'tag.add': 'tag.add',
        'tag.delete': 'tag.delete'
    };

    return cb(null, app);
};

exports.organisations = async function getOrganisations(cfg, cb) {
    return org.getOrganisations(cfg, cb);
};

exports.spaces = async function getSpaces(cfg, msg) {
    return space.getSpaces(cfg, msg);
};

exports.applications = async function getApplication(cfg, msg) {
    return space.getApplication(cfg, msg);
};
