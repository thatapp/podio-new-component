'use strict';

const { expect } = require('chai');
const { toPodioId, toPodioIdOpt, toPodioIdList, MAX_SAFE_PODIO_ID } = require('../../../helpers/coerce');

describe('helpers/coerce.toPodioId', function () {

    it('accepts and returns an integer unchanged', function () {
        expect(toPodioId(19894741)).to.equal(19894741);
    });

    it('parses a numeric string', function () {
        expect(toPodioId('19894741')).to.equal(19894741);
        expect(toPodioId('  724926643  ')).to.equal(724926643);
    });

    it('rejects empty / null / undefined with a field-named error', function () {
        expect(() => toPodioId(null, 'item_id')).to.throw(/item_id is required/);
        expect(() => toPodioId(undefined, 'app_id')).to.throw(/app_id is required/);
        expect(() => toPodioId('', 'space_id')).to.throw(/space_id is required/);
    });

    it('rejects non-numeric strings', function () {
        expect(() => toPodioId('abc')).to.throw(/positive integer/);
        expect(() => toPodioId('12.34')).to.throw(/positive integer/);
        expect(() => toPodioId('1e5')).to.throw(/positive integer/);
    });

    it('rejects zero, negatives, NaN, Infinity', function () {
        expect(() => toPodioId(0)).to.throw(/positive integer/);
        expect(() => toPodioId(-1)).to.throw(/positive integer/);
        expect(() => toPodioId(NaN)).to.throw(/positive integer/);
        expect(() => toPodioId(Infinity)).to.throw(/positive integer/);
    });

    it('rejects values above Number.MAX_SAFE_INTEGER (precision hazard)', function () {
        // 2^53 is unsafe
        expect(() => toPodioId('9007199254740993')).to.throw(/safe-integer/);
    });

    it('exports MAX_SAFE_PODIO_ID as 2^53 - 1', function () {
        expect(MAX_SAFE_PODIO_ID).to.equal(Number.MAX_SAFE_INTEGER);
    });
});

describe('helpers/coerce.toPodioIdOpt', function () {

    it('returns undefined for empty/null/undefined', function () {
        expect(toPodioIdOpt(null)).to.equal(undefined);
        expect(toPodioIdOpt(undefined)).to.equal(undefined);
        expect(toPodioIdOpt('')).to.equal(undefined);
    });

    it('delegates to toPodioId for non-empty input', function () {
        expect(toPodioIdOpt('123')).to.equal(123);
        expect(toPodioIdOpt(456)).to.equal(456);
    });

    it('still throws on garbage input', function () {
        expect(() => toPodioIdOpt('abc', 'id')).to.throw(/positive integer/);
    });
});

describe('helpers/coerce.toPodioIdList', function () {

    it('accepts an array of integers and returns a comma-separated string', function () {
        expect(toPodioIdList([1, 2, 3])).to.equal('1,2,3');
    });

    it('accepts an array of numeric strings', function () {
        expect(toPodioIdList(['19894741', '19890787'])).to.equal('19894741,19890787');
    });

    it('accepts a comma-separated string and round-trips it', function () {
        expect(toPodioIdList('19894741,19890787, 19894049')).to.equal('19894741,19890787,19894049');
    });

    it('accepts a single number', function () {
        expect(toPodioIdList(19894741)).to.equal('19894741');
    });

    it('rejects bad input', function () {
        expect(() => toPodioIdList(['abc'], 'app_ids')).to.throw(/positive integer/);
        expect(() => toPodioIdList({ a: 1 }, 'app_ids')).to.throw(/integer, numeric string, or array/);
    });
});
