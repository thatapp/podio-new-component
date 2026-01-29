'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Get App Inverse Dependencies
 * https://developers.podio.com/doc/applications/get-app-inverse-dependencies-2222036609
 * GET /app/{app_id}/dependencies/inverse
 *
 * Returns the apps that depend ON the given app (apps that have reference fields pointing to this app).
 * Useful for impact analysis before making changes to an app.
 */
exports.process = async function getAppInverseDependencies(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    // Support multiple naming conventions
    const appId = msg.body.app_id || msg.body.appId || msg.body.AppId;

    if (!appId) {
        throw new Error('app_id is required');
    }

    try {
        const url = `/app/${appId}/dependencies/inverse`;
        console.log(`Getting inverse dependencies for app ${appId}`);

        const dependencies = await podio.get(url);

        helper.emitData(cfg, dependencies, that);
    } catch (error) {
        console.error('getAppInverseDependencies failed:', error.message || error);
        await that.emit('error', error);
    }
};
