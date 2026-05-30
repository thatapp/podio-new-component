'use strict';

const { expect } = require('chai');
const {
    RESOLVABLE, RESERVED, CRASHERS, ALL, validate, assertValid,
} = require('../../../helpers/refTypes');

describe('helpers/refTypes constants', function () {

    it('partitions exactly the 69-member registry', function () {
        expect(ALL.size).to.equal(69, 'expected 69 total ref_types');
        expect(RESOLVABLE.size).to.equal(33, 'expected 33 resolvable types');
        expect(RESERVED.size).to.equal(28, 'expected 28 reserved types');
        expect(CRASHERS.size).to.equal(8, 'expected 8 crasher types');
        expect(RESOLVABLE.size + RESERVED.size + CRASHERS.size).to.equal(69);
    });

    it('has no overlap between the three buckets', function () {
        for (const t of RESOLVABLE) {
            expect(RESERVED.has(t), `${t} should not be in RESERVED`).to.equal(false);
            expect(CRASHERS.has(t), `${t} should not be in CRASHERS`).to.equal(false);
        }
        for (const t of RESERVED) {
            expect(CRASHERS.has(t), `${t} should not be in CRASHERS`).to.equal(false);
        }
    });

    it('places known examples in the correct bucket', function () {
        // From the live-Podio audit Part 6
        expect(RESOLVABLE.has('item')).to.equal(true);
        expect(RESOLVABLE.has('app')).to.equal(true);
        expect(RESOLVABLE.has('user')).to.equal(true);
        expect(RESERVED.has('ai_conversation')).to.equal(true);
        expect(RESERVED.has('payment')).to.equal(true);
        expect(RESERVED.has('tag')).to.equal(true);
        expect(CRASHERS.has('rating')).to.equal(true);
        expect(CRASHERS.has('voting')).to.equal(true);
        expect(CRASHERS.has('auth_client')).to.equal(true);
    });
});

describe('helpers/refTypes.validate', function () {

    it('accepts resolvable types on both surfaces', function () {
        const generic = validate('item');
        expect(generic.valid).to.equal(true);
        expect(generic.classification).to.equal('resolvable');

        const reference = validate('item', { surface: 'reference' });
        expect(reference.valid).to.equal(true);
    });

    it('rejects CRASHER types with an explanatory message', function () {
        const r = validate('rating');
        expect(r.valid).to.equal(false);
        expect(r.classification).to.equal('crasher');
        expect(r.message).to.include('crash');
    });

    it('accepts RESERVED types on the generic surface but rejects on reference', function () {
        const generic = validate('tag');
        expect(generic.valid).to.equal(true);
        expect(generic.classification).to.equal('reserved');

        const reference = validate('tag', { surface: 'reference' });
        expect(reference.valid).to.equal(false);
        expect(reference.message).to.include('not resolvable');
    });

    it('rejects unknown types with a helpful suggestion', function () {
        const r = validate('not_a_real_type');
        expect(r.valid).to.equal(false);
        expect(r.classification).to.equal('unknown');
        expect(r.message).to.include('not a member');
    });

    it('rejects empty or non-string input', function () {
        expect(validate('').valid).to.equal(false);
        expect(validate(null).valid).to.equal(false);
        expect(validate(undefined).valid).to.equal(false);
        expect(validate(42).valid).to.equal(false);
    });
});

describe('helpers/refTypes.assertValid', function () {

    it('throws with kind=INVALID_REF_TYPE on invalid input', function () {
        try {
            assertValid('rating');
            expect.fail('expected assertValid to throw');
        } catch (err) {
            expect(err.kind).to.equal('INVALID_REF_TYPE');
            expect(err.classification).to.equal('crasher');
        }
    });

    it('is a no-op on valid input', function () {
        expect(() => assertValid('item')).to.not.throw();
        expect(() => assertValid('tag')).to.not.throw();
    });
});
