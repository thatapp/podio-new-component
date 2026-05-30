'use strict';

/**
 * The 69-member Podio `ref_type` registry and how each type behaves
 * across the API surface.
 *
 * Source: live-Podio audit Part 6 (2026-05-29). The registry was harvested
 * by sending a bogus ref_type to multiple reference-typed endpoints and
 * collecting Podio's `must be one of {...}` enumeration. Resolvability
 * was then classified by probing GET /reference/{type}/1 for each:
 *
 *   "Object not found"  → type resolves; id 1 missing                (RESOLVABLE)
 *   "forbidden"         → type resolves; id 1 real; caller no access (RESOLVABLE)
 *   200 OK              → type resolves; id 1 real and readable      (RESOLVABLE)
 *   "Invalid reference X" → type registered but NOT resolvable        (RESERVED)
 *   "unexpected" 500   → resolver CRASHES on this type               (CRASHER)
 *
 * The 8 CRASHER types are a real Podio bug — passing them to the resolver
 * yields an HTTP 500 unhandled-exception, not a clean error. Reject these
 * at the connector boundary with a helpful message so customers don't see
 * an unhelpful 500 from us.
 *
 * Why this matters at the connector boundary:
 *   - User passes ref_type="rating" expecting tags-like behavior → 500.
 *   - User passes ref_type="ai_conversation" → silent "Invalid reference"
 *     with no explanation that it's a reserved-but-unshipped type.
 *   - User passes ref_type="item" → works fine.
 *   - This validator turns each into a clear user-facing message.
 */

// 33 RESOLVABLE — real referenceable objects; safe to pass to the API.
const RESOLVABLE = Object.freeze(new Set([
    'action', 'app', 'app_field', 'app_revision', 'batch', 'bulletin',
    'comment', 'conversation', 'embed', 'extension', 'file', 'form',
    'grant', 'item', 'item_revision', 'label', 'live', 'message', 'org',
    'partner', 'profile', 'promotion', 'question', 'share', 'space',
    'space_member', 'space_member_request', 'status', 'task', 'user',
    'view', 'vote', 'widget',
]));

// 28 RESERVED — registered enum members but `/reference/{type}/{id}` rejects
// them ("Invalid reference X"). Many ARE usable in other contexts (tags,
// hooks, subscriptions, comments) — they're meta-objects or reserved slots,
// just not first-class resolvable references.
const RESERVED = Object.freeze(new Set([
    'ai_conversation', 'ai_message', 'alert', 'answer', 'campaign',
    'condition', 'condition_set', 'connection', 'contract',
    'extension_installation', 'file_service', 'flow', 'flow_condition',
    'flow_effect', 'hook', 'icon', 'invoice', 'linked_account',
    'location', 'notification', 'org_member', 'payment', 'project',
    'share_install', 'subscription', 'system', 'tag', 'voucher',
]));

// 8 CRASHERS — pass these to `/reference/{type}/1` and Podio returns a
// generic 500 "unexpected error" instead of a clean rejection. Real Podio
// bug. Reject at the connector boundary.
const CRASHERS = Object.freeze(new Set([
    'auth_client', 'identity', 'integration', 'item_participation',
    'question_answer', 'rating', 'task_action', 'voting',
]));

const ALL = Object.freeze(new Set([...RESOLVABLE, ...RESERVED, ...CRASHERS]));

/**
 * Validate a ref_type with optional context about what surface we're hitting.
 *
 * @param {string} refType
 * @param {object} [opts]
 * @param {string} [opts.surface] - 'reference' for /reference/{type}/{id}
 *                                  (which rejects RESERVED + crashes on CRASHERS);
 *                                  'generic' for the broader enum surfaces
 *                                  (comments/hooks/subscriptions/tags where
 *                                  RESERVED types are often valid).
 * @returns {{valid: boolean, message?: string, classification?: string}}
 */
function validate(refType, opts) {
    const surface = (opts && opts.surface) || 'generic';

    if (typeof refType !== 'string' || refType.length === 0) {
        return { valid: false, message: 'ref_type is required (non-empty string).' };
    }

    if (CRASHERS.has(refType)) {
        return {
            valid: false,
            classification: 'crasher',
            message:
                `ref_type "${refType}" causes Podio's resolver to crash (HTTP 500). ` +
                `This is a known platform limitation — see the live-Podio audit Part 6. ` +
                `If you need to address objects of this type, use a different mechanism ` +
                `(e.g. the type's dedicated REST surface if one exists).`,
        };
    }

    if (RESERVED.has(refType)) {
        if (surface === 'reference') {
            return {
                valid: false,
                classification: 'reserved',
                message:
                    `ref_type "${refType}" is registered in Podio's type registry but is not ` +
                    `resolvable via /reference/{type}/{id} ("Invalid reference"). It IS valid ` +
                    `in other contexts (comments, hooks, subscriptions, tags, etc.). ` +
                    `For a list of the 33 resolvable types, see helpers/refTypes.js#RESOLVABLE.`,
            };
        }
        return { valid: true, classification: 'reserved' };
    }

    if (RESOLVABLE.has(refType)) {
        return { valid: true, classification: 'resolvable' };
    }

    return {
        valid: false,
        classification: 'unknown',
        message:
            `ref_type "${refType}" is not a member of Podio's 69-type registry. ` +
            `Did you mean one of: ${[...RESOLVABLE].slice(0, 10).join(', ')}, ...?`,
    };
}

/**
 * Throw if the ref_type is invalid; otherwise no-op. Convenience for actions.
 */
function assertValid(refType, opts) {
    const result = validate(refType, opts);
    if (!result.valid) {
        const err = new Error(result.message);
        err.kind = 'INVALID_REF_TYPE';
        err.classification = result.classification;
        throw err;
    }
}

module.exports = {
    RESOLVABLE,
    RESERVED,
    CRASHERS,
    ALL,
    validate,
    assertValid,
};
