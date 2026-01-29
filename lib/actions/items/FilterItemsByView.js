'use strict';

const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');

// Optimized fields parameter for reduced payload
const FIELDS_PARAM = 'items.view(micro).fields(fields,files,comments,app_item_id_formatted,external_id,created_on,created_by.view(micro),last_event_on)';
const DEFAULT_BATCH_SIZE = 15;

exports.process = async function getItemsByAppAndView(msg, cfg) {
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
    const allItems = [];
    let offset = item.offset || 0;
    let hasMore = true;
    let totalFetched = 0;

    // Build filter payload
    const filterPayload = { ...item };
    delete filterPayload.app_id;
    delete filterPayload.view_id;

    console.log(`Starting get items by view ${item.view_id} with batch size: ${batchSize}`);

    try {
        while (hasMore) {
            // Set pagination for this batch
            filterPayload.limit = batchSize;
            filterPayload.offset = offset;

            // Build URL with optimized fields parameter
            const url = `/item/app/${item.app_id}/filter/${item.view_id}/?fields=${encodeURIComponent(FIELDS_PARAM)}`;

            console.log(`Fetching batch at offset ${offset}...`);
            const response = await podio.post(url, filterPayload);

            if (!response || !response.items) {
                console.log('No items in response');
                break;
            }

            const items = response.items;
            const total = response.total || 0;

            console.log(`Fetched ${items.length} items (total available: ${total})`);

            // Add items to collection
            allItems.push(...items);
            totalFetched += items.length;

            // Check if we should continue
            if (items.length < batchSize || totalFetched >= total) {
                hasMore = false;
            } else {
                offset += batchSize;
            }

            // Emit progress for each batch if splitResult is enabled
            if (cfg.splitResult && items.length > 0) {
                for (const itemData of items) {
                    await that.emit('data', messages.newMessageWithBody(itemData));
                }
            }
        }

        console.log(`Total items fetched: ${allItems.length}`);

        // Emit all items at once if not splitting
        if (!cfg.splitResult) {
            helper.emitData(cfg, allItems, that);
        }

    } catch (error) {
        console.error('getItemsByAppAndView failed:', error.message || error);
        await that.emit('error', error);
    }
};
