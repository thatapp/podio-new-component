'use strict';

/**
 * Boundary-validation helpers for Podio types.
 *
 * Podio's `*_id` fields are 64-bit integers in the API. The component
 * accepts them as strings at the iPaaS UI boundary (TextFieldView keeps
 * the UX flexible — customers may pipe ids through JSONata, env vars,
 * etc. that produce strings). This module coerces and validates those
 * strings at action entry so:
 *
 *   1. We reject obvious garbage (empty, NaN, negative) with a clear error
 *      rather than passing it to Podio and getting an opaque 400 back.
 *   2. We catch precision loss for ids near or above 2^53 (the JS
 *      Number.MAX_SAFE_INTEGER) — Podio is growing toward this range on
 *      auth_client_id, file_id, etc.
 *
 * Usage:
 *
 *   const { toPodioId } = require('../../../helpers/coerce');
 *   const itemId = toPodioId(msg.body.item_id, 'item_id');
 *   const app = await podio.get('/item/' + itemId);
 *
 * Why this is here despite the broader B.14 mass schema sweep being
 * deferred: the schema sweep (converting every *_id input from
 * TextFieldView to NumberFieldView in component.json) carries UI-change
 * risk — existing customer flows wiring strings through mappers/JSONata
 * would need to adapt. The coerce primitive in this module gives every
 * action the ability to opt in to strict validation NOW without forcing
 * a schema migration that touches 80+ schema files.
 */

const MAX_SAFE = Number.MAX_SAFE_INTEGER; // 2^53 - 1

/**
 * Coerce a value to a Podio id (positive integer). Throws a user-facing
 * Error on invalid input. Accepts:
 *   - integers      → returned as-is
 *   - numeric strings like "19894741" or "  724926643  " → parsed
 *   - JS Numbers within safe-integer range
 *
 * Rejects:
 *   - null / undefined / empty string
 *   - non-numeric strings
 *   - negative numbers, zero, NaN, Infinity
 *   - numbers above Number.MAX_SAFE_INTEGER (precision-loss territory)
 *
 * @param {*} value
 * @param {string} [fieldName]  for error messages
 * @returns {number}
 */
function toPodioId(value, fieldName) {
    const label = fieldName || 'id';

    if (value === null || value === undefined || value === '') {
        throw new Error(`${label} is required and must be a positive integer.`);
    }

    let n;
    if (typeof value === 'number') {
        n = value;
    } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!/^-?\d+$/.test(trimmed)) {
            throw new Error(`${label} must be a positive integer; received "${value}".`);
        }
        n = parseInt(trimmed, 10);
    } else {
        throw new Error(`${label} must be a number or numeric string; received ${typeof value}.`);
    }

    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
        throw new Error(`${label} must be a positive integer; received ${value}.`);
    }

    if (n > MAX_SAFE) {
        throw new Error(
            `${label} (${value}) exceeds JavaScript's safe-integer range (2^53). ` +
            `This is a precision hazard and likely a bug — verify the upstream value.`
        );
    }

    return n;
}

/**
 * Coerce an optional id — same as toPodioId, but returns undefined for
 * null/undefined/empty input rather than throwing.
 */
function toPodioIdOpt(value, fieldName) {
    if (value === null || value === undefined || value === '') return undefined;
    return toPodioId(value, fieldName);
}

/**
 * Coerce a list of comma-separated ids (e.g. for /app/features/?app_ids=...).
 * Accepts an array of values OR a single comma-separated string.
 * Returns the canonical comma-separated string form ("123,456,789").
 */
function toPodioIdList(value, fieldName) {
    if (Array.isArray(value)) {
        return value.map((v) => toPodioId(v, fieldName)).join(',');
    }
    if (typeof value === 'string') {
        return value.split(',').map((v) => toPodioId(v, fieldName)).join(',');
    }
    if (typeof value === 'number') {
        return String(toPodioId(value, fieldName));
    }
    throw new Error(`${fieldName || 'ids'} must be an integer, numeric string, or array of either.`);
}

module.exports = {
    toPodioId,
    toPodioIdOpt,
    toPodioIdList,
    MAX_SAFE_PODIO_ID: MAX_SAFE,
};
