'use strict';

const { expect } = require('chai');
const { normalizeFieldValue } = require('../../../helpers/itemHelper');

// undefined return  = OMIT (leave the field unchanged in Podio)
// []  return         = CLEAR (Podio empties a field given an empty list)
// anything else      = send as-is
describe('helpers/itemHelper.normalizeFieldValue', function () {

    it('omits unchanged/empty scalars (null, undefined, "", "null")', function () {
        expect(normalizeFieldValue(null)).to.equal(undefined);
        expect(normalizeFieldValue(undefined)).to.equal(undefined);
        expect(normalizeFieldValue('')).to.equal(undefined);
        expect(normalizeFieldValue('   ')).to.equal(undefined);
        expect(normalizeFieldValue('null')).to.equal(undefined);
    });

    it('treats the clear sentinels "[]" and [] as a field clear', function () {
        expect(normalizeFieldValue('[]')).to.deep.equal([]);
        expect(normalizeFieldValue(' [] ')).to.deep.equal([]);
        expect(normalizeFieldValue([])).to.deep.equal([]);
    });

    it('passes real scalar values through (text, number, 0)', function () {
        expect(normalizeFieldValue('hello')).to.equal('hello');
        expect(normalizeFieldValue(42)).to.equal(42);
        expect(normalizeFieldValue(0)).to.equal(0);
    });

    it('passes populated multi-value arrays through', function () {
        expect(normalizeFieldValue([1, 2, 3])).to.deep.equal([1, 2, 3]);
    });

    it('clears value-bearing objects whose value is an empty sentinel', function () {
        expect(normalizeFieldValue({ value: '[]' })).to.deep.equal([]);
        expect(normalizeFieldValue({ value: [] })).to.deep.equal([]);
        // { value: null } means "no value" → omit, matching prior behavior
        expect(normalizeFieldValue({ value: null })).to.equal(undefined);
        expect(normalizeFieldValue({ value: '' })).to.equal(undefined);
    });

    it('keeps populated value-bearing objects (money, email, reference)', function () {
        expect(normalizeFieldValue({ value: 100, currency: 'USD' }))
            .to.deep.equal({ value: 100, currency: 'USD' });
        expect(normalizeFieldValue({ type: 'work', value: 'a@b.com' }))
            .to.deep.equal({ type: 'work', value: 'a@b.com' });
    });

    it('clears date objects whose anchor date is empty ("[]" or [])', function () {
        expect(normalizeFieldValue({ start_date: [], end_date: [] })).to.deep.equal([]);
        expect(normalizeFieldValue({ start_date: '[]' })).to.deep.equal([]);
        expect(normalizeFieldValue({ start_date: '' })).to.deep.equal([]);
    });

    it('keeps populated date objects', function () {
        const d = { start_date: '2024-03-15', start_time: '14:30' };
        expect(normalizeFieldValue(d)).to.deep.equal(d);
    });

    it('clears embed objects with an empty value, keeps resolved ones', function () {
        expect(normalizeFieldValue({ embed: '[]' })).to.deep.equal([]);
        expect(normalizeFieldValue({ embed: [] })).to.deep.equal([]);
        expect(normalizeFieldValue({ embed: null })).to.deep.equal([]);
        expect(normalizeFieldValue({ embed: 999 })).to.deep.equal({ embed: 999 });
    });
});
