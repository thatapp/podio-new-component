'use strict';

const { expect } = require('chai');
const { fieldTransform } = require('../../../helpers/itemHelper');

describe('helpers/itemHelper.fieldTransform', function () {

    it('keeps money fields whole when value is numeric (regression: currency was lost)', function () {
        const out = fieldTransform({ price: { value: 100, currency: 'USD' } });
        expect(out.price).to.deep.equal({ value: 100, currency: 'USD' });
    });

    it('preserves a numeric zero value', function () {
        const out = fieldTransform({ price: { value: 0, currency: 'EUR' } });
        expect(out.price).to.deep.equal({ value: 0, currency: 'EUR' });
    });

    it('keeps location fields whole even with a non-string value', function () {
        const loc = { city: 'Oslo', value: 'Oslo, NO', lat: 59.9, lng: 10.7 };
        expect(fieldTransform({ where: loc }).where).to.deep.equal(loc);
    });

    it('keeps email/phone objects with type + value', function () {
        const out = fieldTransform({ mail: { type: 'work', value: 'a@b.com' } });
        expect(out.mail).to.deep.equal({ type: 'work', value: 'a@b.com' });
    });

    it('unwraps a simple { value } wrapper (single reference)', function () {
        expect(fieldTransform({ ref: { value: 123 } }).ref).to.equal(123);
    });

    it('passes date objects through (no value key)', function () {
        const d = { start_date: '2024-03-15' };
        expect(fieldTransform({ due: d }).due).to.deep.equal(d);
    });

    it('splits semicolon-delimited multi-values into an array', function () {
        expect(fieldTransform({ tags: 'a;b;c' }).tags).to.deep.equal(['a', 'b', 'c']);
    });
});
