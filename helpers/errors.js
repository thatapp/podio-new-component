'use strict';

/**
 * Central Podio error normalization for this connector.
 *
 * Purpose
 * -------
 * Turn the bag of `{statusCode, body}` shapes returned by `request`/`axios`
 * into a single, predictable `Error` carrying:
 *
 *   err.statusCode      - HTTP status from Podio
 *   err.podioError      - Podio's `error` keyword ('not_found', 'forbidden', 'rate_limit', ...)
 *   err.errorParameters - Podio's `error_parameters` object. For enum-constrained
 *                         params Podio leaks the allowed set here ("Must be one of {...}").
 *   err.errorPropagate  - Podio's `error_propagate` flag (true = upstream/provider error,
 *                         surface verbatim).
 *   err.kind            - One of the diagnostic classifications below.
 *   err.retry           - true for retryable errors (rate-limit 420, 5xx).
 *                         The iPaaS sailor auto-retries when this is set —
 *                         see https://docs.elastic.io/developers/error-retry.html
 *                         (10 retries, exponential backoff, 24h TTL).
 *
 * Why this matters
 * ----------------
 * The platform's auto-retry mechanism is gated on err.retry. Without it,
 * transient rate-limit and server errors fail permanently on the first hit
 * instead of being retried — the dominant cause of "iPaaS shows 1000
 * processed but Podio is missing some" reports.
 *
 * Diagnostic kinds (from the live-Podio audit, 2026-05-29 Part 0):
 *
 *   ROUTE_GONE         - 404 with "No matching operation could be found"
 *                        Path doesn't exist on Podio. Caller bug, not user input.
 *   RESOURCE_MISSING   - 404 with "Object not found"
 *                        Path exists; the referenced id doesn't.
 *   FORBIDDEN          - 403 (or 404 with explicit forbidden text)
 *                        Caller authenticated but lacks rights on this object.
 *   INVALID_REFERENCE  - 400 with "Invalid reference X"
 *                        The ref_type is in the global 69-type registry but
 *                        not actually resolvable. See audit Part 6.
 *   RATE_LIMIT         - 420 (or body.error === 'rate_limit')
 *                        Partner tier is 75,000 calls/hour. Retryable.
 *   UNAUTHORIZED       - 401. Token expired or invalid. Caller should refresh
 *                        (podio.js handles this via the refresh flow).
 *   SERVER_ERROR       - 5xx. Retryable.
 *   PROVIDER_ERROR     - Any 4xx with error_propagate: true. Upstream/integration
 *                        error from a connected service; surface verbatim, not
 *                        retryable (the provider is the source of truth).
 *   OTHER              - Default for anything that doesn't match above.
 */

function normalizePodioError(statusCode, body) {
    const description = (body && body.error_description) || `HTTP ${statusCode}`;
    const err = new Error(description);

    err.statusCode = statusCode;
    err.podioError = body && body.error ? body.error : null;
    err.errorParameters = (body && body.error_parameters) || null;
    err.errorPropagate = !!(body && body.error_propagate);

    // Classification — fingerprint the error template
    if (statusCode === 401 || (body && body.error === 'unauthorized')) {
        err.kind = 'UNAUTHORIZED';
    } else if (statusCode === 420 || (body && body.error === 'rate_limit')) {
        err.kind = 'RATE_LIMIT';
        err.retry = true;                          // platform will exp-backoff retry
    } else if (statusCode >= 500 && statusCode < 600) {
        err.kind = 'SERVER_ERROR';
        err.retry = true;                          // transient server-side; retry
    } else if (err.errorPropagate) {
        err.kind = 'PROVIDER_ERROR';               // do NOT retry — upstream is canonical
    } else if (statusCode === 404 && /No matching operation/i.test(description)) {
        err.kind = 'ROUTE_GONE';
    } else if (statusCode === 404 && /Object not found/i.test(description)) {
        err.kind = 'RESOURCE_MISSING';
    } else if (statusCode === 403 || (body && body.error === 'forbidden')) {
        err.kind = 'FORBIDDEN';
    } else if (statusCode === 400 && /Invalid reference/i.test(description)) {
        err.kind = 'INVALID_REFERENCE';
    } else {
        err.kind = 'OTHER';
    }

    return err;
}

/**
 * Format a user-visible error string that surfaces Podio's allowed-value sets
 * when present. Turns Podio's hidden enum-leak into in-product help.
 *
 *   "Invalid value 'list' (string): must be one of {'card','badge','table','stream'}"
 *
 * becomes "Invalid value 'list' (string): must be one of {'card','badge','table','stream'}.
 *         Allowed: card, badge, table, stream."
 */
function formatUserError(err) {
    if (!err) return 'Unknown error';
    let msg = err.message || 'Unknown error';

    if (err.errorParameters && typeof err.errorParameters === 'object') {
        const keys = Object.keys(err.errorParameters);
        if (keys.length > 0) {
            const detail = keys
                .map((k) => `${k}=${JSON.stringify(err.errorParameters[k])}`)
                .join(', ');
            msg += ` [params: ${detail}]`;
        }
    }

    if (err.kind === 'ROUTE_GONE') {
        msg += ' (Podio route does not exist — this is a connector bug, not a user-input problem.)';
    } else if (err.kind === 'RESOURCE_MISSING') {
        msg += ' (The referenced object id was not found in Podio.)';
    } else if (err.kind === 'FORBIDDEN') {
        msg += ' (Authenticated user lacks access to this object.)';
    } else if (err.kind === 'INVALID_REFERENCE') {
        msg += ' (This ref_type cannot be resolved as a standalone reference. See connector docs for the 33-type resolvable subset.)';
    } else if (err.kind === 'RATE_LIMIT') {
        msg += ' (Podio rate-limit hit — platform will retry automatically.)';
    } else if (err.kind === 'PROVIDER_ERROR') {
        msg += ' (Error from an upstream integration provider; check provider settings.)';
    }

    return msg;
}

module.exports = {
    normalizePodioError,
    formatUserError,
};
