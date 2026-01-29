'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Add an Embed
 * https://developers.podio.com/doc/embeds/add-an-embed-726483
 * POST /embed/
 *
 * Fetches metadata for a URL to create an embed. Returns title, description,
 * thumbnail, and other metadata useful for link previews.
 *
 * Embeds can be used in statuses, conversations, comments, and can be
 * attached to items using embed field types.
 */
exports.process = async function addEmbed(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const input = msg.body;

    if (!input.url) {
        throw new Error('url is required (absolute URL including protocol)');
    }

    try {
        const payload = {
            url: input.url
        };

        // Optional: mode - "immediate" (default) or "delayed" for async lookup
        if (input.mode) {
            payload.mode = input.mode;
        }

        console.log(`Creating embed for URL: ${input.url}`);

        const embed = await podio.post('/embed/', payload);

        helper.emitData(cfg, embed, that);
    } catch (error) {
        console.error('addEmbed failed:', error.message || error);
        await that.emit('error', error);
    }
};
