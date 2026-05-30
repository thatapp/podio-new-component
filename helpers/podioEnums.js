'use strict';

/**
 * Centralized enum constants harvested from the live Podio API via the
 * "Must be one of {...}" trick. Every set here was verified against
 * api.podio.com on 2026-05-29 (live-Podio audit Part 2.3 + Part 3).
 *
 * Why centralize:
 *   - These values were previously hardcoded in scattered locations
 *     (component.json fields, action files, schemas) with no single
 *     source of truth. When Podio adds or removes a value, multiple
 *     files drift independently.
 *   - This file lets us re-probe at CI time (a small script that POSTs
 *     a deliberately-bad value to each constrained endpoint and diffs
 *     the response's "Must be one of" set against these constants).
 *   - Each export carries an `auditRef` comment naming the section of
 *     the audit doc that captured it, so future maintainers can trace
 *     provenance.
 *
 * NOTE: This is the *source of truth* — places that hardcode these enums
 * (component.json, individual actions, schema notes) should be replaced
 * with references to these constants in subsequent edits.
 */

// --- Spaces / membership -----------------------------------------------------

/** Space privacy (audit §2.3 — PUT /space/{id} {"privacy":"..."}). */
const SPACE_PRIVACY = Object.freeze(['closed', 'open']);

/** Space member role (audit §2.3 — POST /space/{id}/member/ {"role":"..."}). */
const SPACE_MEMBER_ROLE = Object.freeze([
    'regular',
    'admin',
    'light',
    'grant_only',
]);

// --- Views -------------------------------------------------------------------

/** View layout (audit §2.3 — POST /view/app/{id}/ {"layout":"..."}).
 *  Notable: `table-new` and `badge` are not in the public view docs. */
const VIEW_LAYOUT = Object.freeze([
    'card', 'badge', 'table-new', 'calendar', 'table', 'stream',
]);

// --- Grants ------------------------------------------------------------------

/** Grant action (audit §2.3 — POST /grant/{ref_type}/{id}/ {"action":"..."}).
 *  Identical for app and item refs. */
const GRANT_ACTION = Object.freeze(['view', 'comment', 'rate']);

// --- Tasks -------------------------------------------------------------------

/** Task grouping (audit §2.3 — GET /task/?grouping=...). */
const TASK_GROUPING = Object.freeze([
    'app', 'completed_on', 'created_by', 'due_date', 'label',
    'org', 'reference', 'responsible', 'space',
]);

/** Task sort_by (audit §2.3). */
const TASK_SORT_BY = Object.freeze([
    'completed_on', 'created_on', 'rank',
]);

// --- Hooks (per-scope allowed event types) ----------------------------------
// Audit Part 5 + this connector's B.7 fix. Critically: `app_field` only
// accepts `item.update` — the previous fall-through to the full `app`
// menu was the single largest source of "I picked a hook type and it
// doesn't fire" support tickets on field-level webhooks.

const HOOK_TYPES_SPACE = Object.freeze([
    'app.create',
    'contact.create', 'contact.delete', 'contact.update',
    'member.add', 'member.remove',
    'status.create', 'status.update', 'status.delete',
    'task.create', 'task.update',
]);

const HOOK_TYPES_APP = Object.freeze([
    'app.delete', 'app.update',
    'comment.create', 'comment.delete',
    'file.change',
    'form.create', 'form.delete', 'form.update',
    'item.create', 'item.delete', 'item.update',
    'tag.add', 'tag.delete',
]);

/** Field-level hooks ONLY accept item.update — anything else gets rejected
 *  by Podio at submit-time. AND calc fields never fire even for this
 *  (audit Part 5). */
const HOOK_TYPES_APP_FIELD = Object.freeze(['item.update']);

// --- Embeds ------------------------------------------------------------------

/** Embed mode (audit §2.3 — POST /embed/ {"mode":"..."}).
 *  Note: public docs list only 2; live API accepts 4. */
const EMBED_MODE = Object.freeze(['immediate', 'auto', 'never', 'delayed']);

// --- Widgets -----------------------------------------------------------------

/** Widget type (audit §2.3 — POST /widget/space/{id}/ {"type":"..."}).
 *  Notable undocumented values: `favourite_apps`, `recent_items`. */
const WIDGET_TYPE = Object.freeze([
    'app_view', 'apps', 'calculation', 'contacts', 'events',
    'favourite_apps', 'files', 'image', 'link', 'profiles',
    'recent_items', 'tag_cloud', 'tasks', 'text',
]);

// --- Voting ------------------------------------------------------------------

/** Voting kind (audit §2.3 — POST /voting/app/{id}/voting {"kind":"..."}).
 *  Note: the param is `kind`, not `type`. */
const VOTING_KIND = Object.freeze(['answer', 'fivestar']);

// --- Layout ------------------------------------------------------------------

/** Badge/card layout types (audit §2.3 — GET /layout/{app_id}/{layout_type}).
 *  Notable: `card` and `badge_v2` are not in public docs. */
const LAYOUT_TYPE = Object.freeze(['badge', 'relationship', 'card', 'badge_v2']);

// --- Recurrence --------------------------------------------------------------

const RECURRENCE_DAYS = Object.freeze([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]);

const RECURRENCE_REPEAT_ON = Object.freeze(['day_of_month', 'day_of_week']);

// --- Item export -------------------------------------------------------------

/** POST /item/app/{id}/export/{exporter}/. */
const ITEM_EXPORTER = Object.freeze(['csv', 'xls', 'xlsx']);

// --- Flow engine -------------------------------------------------------------

/** POST /flow/app/{id}/attributes/ — cause.type. */
const FLOW_CAUSE_TYPE = Object.freeze(['item.create', 'item.delete', 'item.update']);

/** POST /flow/app/{id}/effect/attributes/ — effect.type.
 *  Notable: three undocumented effect types (item.create, item.grant,
 *  item.update.related); the public-docs `octoblu.trigger` is gone. */
const FLOW_EFFECT_TYPE = Object.freeze([
    'comment.create', 'conversation.create',
    'item.create', 'item.grant', 'item.update', 'item.update.related',
    'status.create', 'task.create',
]);

// --- App market --------------------------------------------------------------

const APP_MARKET_TOP_TYPE = Object.freeze(['app', 'pack']);

module.exports = {
    // spaces / members
    SPACE_PRIVACY,
    SPACE_MEMBER_ROLE,

    // views
    VIEW_LAYOUT,

    // grants
    GRANT_ACTION,

    // tasks
    TASK_GROUPING,
    TASK_SORT_BY,

    // hooks
    HOOK_TYPES_SPACE,
    HOOK_TYPES_APP,
    HOOK_TYPES_APP_FIELD,

    // embeds / widgets / voting / layout
    EMBED_MODE,
    WIDGET_TYPE,
    VOTING_KIND,
    LAYOUT_TYPE,

    // recurrence
    RECURRENCE_DAYS,
    RECURRENCE_REPEAT_ON,

    // item export
    ITEM_EXPORTER,

    // flows
    FLOW_CAUSE_TYPE,
    FLOW_EFFECT_TYPE,

    // app market
    APP_MARKET_TOP_TYPE,
};
