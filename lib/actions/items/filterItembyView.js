'use strict';

const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

const DEFAULT_BATCH_SIZE = 15;

exports.process = async function filterItemByView(msg, cfg) {
    const that = this;
    const item = msg.body;
    const podio = new Podio(cfg);

    if (!item.app_id) {
        throw new Error('app_id is required');
    }
    if (!item.view_id) {
        throw new Error('view_id is required');
    }

    const batchSize = item.limit || DEFAULT_BATCH_SIZE;
    let offset = item.offset || 0;
    let hasMore = true;
    let totalFetched = 0;

    // Build clean payload - view endpoint only accepts: limit, offset, sort_by, sort_desc
    // The view itself contains the filters, so do NOT send a filters param
    const filterPayload = {};
    if (item.sort_by) filterPayload.sort_by = item.sort_by;
    if (item.sort_desc !== undefined && item.sort_desc !== '' && item.sort_desc !== null) {
        filterPayload.sort_desc = (item.sort_desc === true || item.sort_desc === 'true');
    }

    console.log(`Starting filter by view ${item.view_id} with batch size: ${batchSize}`);

    try {
        while (hasMore) {
            filterPayload.limit = batchSize;
            filterPayload.offset = offset;

            const url = `/item/app/${item.app_id}/filter/${item.view_id}/`;

            console.log(`Fetching batch at offset ${offset}...`);
            const response = await podio.post(url, filterPayload);

            if (!response || !response.items) {
                console.log('No items in response');
                break;
            }

            const items = response.items;
            const total = response.total || 0;

            console.log(`Fetched ${items.length} items (total available: ${total})`);

            // Emit each item individually so downstream steps process one at a time
            for (const itemData of items) {
                await that.emit('data', messages.newMessageWithBody(itemData));
            }

            totalFetched += items.length;

            if (items.length < batchSize || totalFetched >= total) {
                hasMore = false;
            } else {
                offset += batchSize;
            }
        }

        console.log(`Total items emitted: ${totalFetched}`);

    } catch (error) {
        console.error('filterItemByView failed:', error.message || error);
        await that.emit('error', error);
    }
};
