'use strict';

const { expect } = require('chai');
const enums = require('../../../helpers/podioEnums');

describe('helpers/podioEnums constants', function () {

    it('exposes the verified live values for each enum from audit Part 2.3', function () {
        expect(enums.SPACE_PRIVACY).to.have.members(['closed', 'open']);
        expect(enums.SPACE_MEMBER_ROLE).to.have.members(['regular', 'admin', 'light', 'grant_only']);

        expect(enums.VIEW_LAYOUT).to.have.members(
            ['card', 'badge', 'table-new', 'calendar', 'table', 'stream']
        );

        expect(enums.GRANT_ACTION).to.have.members(['view', 'comment', 'rate']);

        expect(enums.TASK_GROUPING).to.have.members(
            ['app', 'completed_on', 'created_by', 'due_date', 'label',
             'org', 'reference', 'responsible', 'space']
        );

        expect(enums.EMBED_MODE).to.have.members(['immediate', 'auto', 'never', 'delayed']);
        expect(enums.VOTING_KIND).to.have.members(['answer', 'fivestar']);
        expect(enums.LAYOUT_TYPE).to.have.members(['badge', 'relationship', 'card', 'badge_v2']);

        expect(enums.RECURRENCE_DAYS).to.have.members(
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        );

        expect(enums.ITEM_EXPORTER).to.have.members(['csv', 'xls', 'xlsx']);
    });

    it('HOOK_TYPES_APP_FIELD contains ONLY item.update (the B.7 fix)', function () {
        expect(enums.HOOK_TYPES_APP_FIELD).to.have.length(1);
        expect(enums.HOOK_TYPES_APP_FIELD[0]).to.equal('item.update');
    });

    it('all enum arrays are frozen (single source of truth — immutable)', function () {
        for (const key of Object.keys(enums)) {
            const value = enums[key];
            if (Array.isArray(value)) {
                expect(Object.isFrozen(value), `${key} should be frozen`).to.equal(true);
            }
        }
    });

    it('FLOW_EFFECT_TYPE includes the three undocumented effect types', function () {
        // Audit Part 2.3 — these were not in Podio's public flow docs but
        // are accepted by the live API
        expect(enums.FLOW_EFFECT_TYPE).to.include('item.create');
        expect(enums.FLOW_EFFECT_TYPE).to.include('item.grant');
        expect(enums.FLOW_EFFECT_TYPE).to.include('item.update.related');
    });
});
