'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Post-batch reconciliation by `external_id`.
 *
 * Given a Podio `app_id` and an array of `external_ids` your upstream batch
 * tried to write, this action asks Podio directly which ones actually
 * landed. The iPaaS execution count is not authoritative — Podio is. This
 * is the belt-and-suspenders pattern that closes the loop on "iPaaS shows
 * 1000 processed but Podio has fewer" reports.
 *
 * Suggested flow shape (the canonical reliable-batch pattern):
 *
 *     upstreamTrigger
 *       → createItemIdempotent (per item, using stable upstream id as external_id)
 *       → ... downstream steps ...
 *       → (at end of batch) reconcileBatch
 *       → router on result.missing.length > 0
 *           → back to createItemIdempotent for the missing set
 *
 * Output shape:
 *
 *     {
 *       app_id: 19894741,
 *       requested_count: 1000,
 *       found: [{external_id: "src-1", item_id: 724926643}, ...],
 *       missing: ["src-42", "src-187", ...],
 *       errors:  [{external_id: "src-99", error: "..."}, ...]
 *     }
 *
 * Performance note: this issues one GET per external_id (Podio's
 * `/item/app/{app_id}/external_id/{ext_id}` endpoint), so a 1000-item
 * reconcile costs ~1000 API calls. That's well inside the partner-tier
 * 75,000/hr ceiling but worth budgeting. Calls run sequentially with a
 * concurrency cap of CONCURRENCY (default 4) to avoid spiky bursts.
 */

const DEFAULT_CONCURRENCY = 4;

async function lookupOne(podio, appId, externalId) {
    try {
        const item = await podio.get(
            `/item/app/${appId}/external_id/${encodeURIComponent(externalId)}`
        );
        return { external_id: externalId, item_id: item && item.item_id, kind: 'found' };
    } catch (err) {
        if (err.kind === 'RESOURCE_MISSING' || err.statusCode === 404) {
            return { external_id: externalId, kind: 'missing' };
        }
        // Real error (forbidden, rate-limit, server error). Track separately
        // so the caller can decide whether to retry / surface.
        return { external_id: externalId, kind: 'error', error: err.message || String(err), statusCode: err.statusCode };
    }
}

async function runWithConcurrency(items, worker, concurrency) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function lane() {
        while (true) {
            const i = nextIndex++;
            if (i >= items.length) return;
            results[i] = await worker(items[i], i);
        }
    }

    const lanes = [];
    for (let i = 0; i < Math.max(1, Math.min(concurrency, items.length)); i++) {
        lanes.push(lane());
    }
    await Promise.all(lanes);
    return results;
}

exports.process = async function reconcileBatch(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const item = msg.body || {};

    const appId = cfg.appId || item.app_id;
    const externalIds = item.external_ids;
    const concurrency = parseInt(cfg.concurrency, 10) || DEFAULT_CONCURRENCY;

    if (!appId) {
        throw new Error('app_id is required (set in action config or pass via msg.body.app_id)');
    }
    if (!Array.isArray(externalIds) || externalIds.length === 0) {
        throw new Error('external_ids must be a non-empty array of strings — pass the same external_ids you used when creating the items');
    }

    try {
        const lookups = await runWithConcurrency(
            externalIds.map(String),
            (ext) => lookupOne(podio, appId, ext),
            concurrency
        );

        const found = [];
        const missing = [];
        const errors = [];
        for (const r of lookups) {
            if (r.kind === 'found') found.push({ external_id: r.external_id, item_id: r.item_id });
            else if (r.kind === 'missing') missing.push(r.external_id);
            else if (r.kind === 'error') errors.push({ external_id: r.external_id, error: r.error, statusCode: r.statusCode });
        }

        const summary = {
            app_id: parseInt(appId, 10) || appId,
            requested_count: externalIds.length,
            found_count: found.length,
            missing_count: missing.length,
            error_count: errors.length,
            found,
            missing,
            errors,
        };

        helper.emitData(cfg, summary, that);
    } catch (err) {
        that.emit('error', err);
    }
};
