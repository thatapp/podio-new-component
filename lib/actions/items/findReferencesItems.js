'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Find Referenceable Items
 * https://developers.podio.com/doc/items/find-referenceable-items-22485
 * GET /item/field/{field_id}/find
 *
 * Returns items that are valid references to the given field.
 * Used for app reference fields to find items that can be linked.
 */
exports.process = async function findReferenceableItems(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    // Support both snake_case and camelCase for backwards compatibility
    const fieldId = msg.body.field_id || msg.body.fieldId || msg.body.FieldId;

    if (!fieldId) {
        throw new Error('field_id is required');
    }

    try {
        const url = `/item/field/${fieldId}/find`;

        // Build query parameters
        const params = {};

        if (msg.body.limit) {
            params.limit = msg.body.limit;
        }
        if (msg.body.not_item_id || msg.body.not_item_ids) {
            // Can be a single ID or array of IDs to exclude
            params.not_item_id = msg.body.not_item_id || msg.body.not_item_ids;
        }
        if (msg.body.text) {
            params.text = msg.body.text;
        }

        console.log(`Finding referenceable items: ${url}`, params);

        const items = await podio.get(url, params);

        helper.emitData(cfg, items, that);
    } catch (error) {
        console.error('findReferenceableItems failed:', error.message || error);
        await that.emit('error', error);
    }
};
