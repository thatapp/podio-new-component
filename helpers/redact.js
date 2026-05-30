'use strict';

/**
 * Mask sensitive fields in Podio API responses before logging.
 *
 * Per the live-Podio audit Part 10 + Part 2.4, several routine Podio
 * response fields are *credentials* in disguise:
 *
 *   - `mailbox`         — the prefix of the user's @inbox.podio.com address;
 *                         anyone with it can email items into the inbox.
 *   - `calendar_code`   — 64-char ICS-feed token; gives full calendar read.
 *   - `referral.code`   — the user's referral identifier.
 *   - `push.signature`  — Bayeux/Faye realtime subscription token; gives
 *                         live updates on the channel.
 *   - `presence`        — real-time who's-viewing-now (PII).
 *   - `created_via.auth_client_id` — identifies the integration provenance
 *                         on every object; useful but business-sensitive.
 *
 * Plus the OAuth-shaped fields that should never be logged in plaintext:
 *   - `access_token`, `refresh_token`, `oauth.access_token`, `oauth.refresh_token`
 *
 * This helper produces a SHALLOW deep clone with these keys masked. Apply
 * before any logger call that ships a Podio response body to the platform's
 * logging pipeline (Bunyan via this.logger, or fallback console.*).
 *
 *   const safe = redactSensitive(podioResponse);
 *   this.logger.info({ created: safe });
 *
 * Performance note: redactSensitive walks the tree once; cheap on the
 * typical Podio response. Don't apply on hot paths if profiling shows it.
 */

const SENSITIVE_KEYS = new Set([
    'access_token',
    'refresh_token',
    'mailbox',
    'calendar_code',
    'referral',
    'push',
    'presence',
    'signature',
]);

const REDACTED = '[REDACTED]';

function redactValue(key, value) {
    if (SENSITIVE_KEYS.has(key)) return REDACTED;
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(v => redactValue(null, v));
    const out = {};
    for (const k of Object.keys(value)) {
        out[k] = redactValue(k, value[k]);
    }
    return out;
}

/**
 * Redact sensitive fields from an arbitrary object/value.
 *
 * @param {*} input  Anything — typically a Podio response body or an object
 *                   that wraps one.
 * @returns {*}      A safe-to-log copy with `[REDACTED]` masking applied.
 */
function redactSensitive(input) {
    return redactValue(null, input);
}

/**
 * Convenience: stringify with redaction applied. Useful for `this.logger.info`
 * call sites that previously did `console.log(JSON.stringify(body))`.
 */
function safeStringify(input) {
    try {
        return JSON.stringify(redactSensitive(input));
    } catch (e) {
        return '[unserializable]';
    }
}

module.exports = {
    redactSensitive,
    safeStringify,
    SENSITIVE_KEYS,
};
