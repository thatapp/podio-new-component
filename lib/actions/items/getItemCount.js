'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Get Item Count
 * https://developers.podio.com/doc/items/get-item-count-34819997
 * GET /item/app/{app_id}/count
 *
 * Returns the total number of items in the given app.
 */
exports.process = async function getItemCount(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    // Support both snake_case and camelCase for backwards compatibility
    const appId = msg.body.app_id || msg.body.appId || msg.body.AppId;

    if (!appId) {
        throw new Error('app_id is required');
    }

    try {
        const url = `/item/app/${appId}/count`;
        console.log(`Getting item count: ${url}`);

        const count = await podio.get(url);

        helper.emitData(cfg, count, that);
    } catch (error) {
        console.error('getItemCount failed:', error.message || error);
        await that.emit('error', error);
    }
};
