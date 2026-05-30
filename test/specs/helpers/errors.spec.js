'use strict';

const { expect } = require('chai');
const { normalizePodioError, formatUserError } = require('../../../helpers/errors');

describe('helpers/errors.normalizePodioError', function () {

    it('marks RATE_LIMIT (HTTP 420) as retryable', function () {
        const err = normalizePodioError(420, {
            error: 'rate_limit',
            error_description: 'You have hit the rate limit'
        });
        expect(err.kind).to.equal('RATE_LIMIT');
        expect(err.retry).to.equal(true);
        expect(err.statusCode).to.equal(420);
    });

    it('marks SERVER_ERROR (5xx) as retryable', function () {
        for (const code of [500, 502, 503, 504]) {
            const err = normalizePodioError(code, {
                error: 'server_error',
                error_description: 'transient'
            });
            expect(err.kind, `expected SERVER_ERROR for ${code}`).to.equal('SERVER_ERROR');
            expect(err.retry, `expected retry=true for ${code}`).to.equal(true);
        }
    });

    it('classifies UNAUTHORIZED (HTTP 401)', function () {
        const err = normalizePodioError(401, {
            error: 'unauthorized',
            error_description: 'expired_token'
        });
        expect(err.kind).to.equal('UNAUTHORIZED');
        expect(err.retry).to.be.oneOf([undefined, false]);
    });

    it('distinguishes ROUTE_GONE from RESOURCE_MISSING on 404', function () {
        const routeGone = normalizePodioError(404, {
            error: 'not_found',
            error_description: "No matching operation could be found. The path '/search/v2' was not found."
        });
        expect(routeGone.kind).to.equal('ROUTE_GONE');
        expect(routeGone.retry).to.be.oneOf([undefined, false]);

        const resourceMissing = normalizePodioError(404, {
            error: 'not_found',
            error_description: 'Object not found'
        });
        expect(resourceMissing.kind).to.equal('RESOURCE_MISSING');
    });

    it('classifies FORBIDDEN (HTTP 403) — not retryable', function () {
        const err = normalizePodioError(403, {
            error: 'forbidden',
            error_description: 'The user with id 28918 does not have the right view on user with id 1'
        });
        expect(err.kind).to.equal('FORBIDDEN');
        expect(err.retry).to.be.oneOf([undefined, false]);
    });

    it('classifies INVALID_REFERENCE (HTTP 400 with "Invalid reference X")', function () {
        const err = normalizePodioError(400, {
            error: 'not_found',
            error_description: 'Invalid reference ai_conversation'
        });
        expect(err.kind).to.equal('INVALID_REFERENCE');
    });

    it('classifies PROVIDER_ERROR when error_propagate=true (not retryable — upstream)', function () {
        const err = normalizePodioError(400, {
            error: 'integration.error',
            error_description: 'Please check your settings and try again',
            error_propagate: true
        });
        expect(err.kind).to.equal('PROVIDER_ERROR');
        expect(err.errorPropagate).to.equal(true);
        expect(err.retry).to.be.oneOf([undefined, false]);
    });

    it('surfaces errorParameters verbatim', function () {
        const err = normalizePodioError(400, {
            error: 'invalid_value',
            error_description: "Invalid value 'list' (string): must be one of {'card','badge','table'}",
            error_parameters: { allowed: ['card', 'badge', 'table'] }
        });
        expect(err.errorParameters).to.deep.equal({ allowed: ['card', 'badge', 'table'] });
    });

    it('falls back to OTHER for unrecognized 4xx', function () {
        const err = normalizePodioError(418, {
            error: 'teapot',
            error_description: 'i am a teapot'
        });
        expect(err.kind).to.equal('OTHER');
    });

    it('survives empty bodies', function () {
        const err = normalizePodioError(500, {});
        expect(err.message).to.equal('HTTP 500');
        expect(err.kind).to.equal('SERVER_ERROR');
    });
});

describe('helpers/errors.formatUserError', function () {

    it('appends helpful kind-specific context to the message', function () {
        const err = normalizePodioError(404, {
            error: 'not_found',
            error_description: "No matching operation could be found. The path 'X' was not found."
        });
        const formatted = formatUserError(err);
        expect(formatted).to.include('Podio route does not exist');
        expect(formatted).to.include('connector bug');
    });

    it('mentions automatic retry for RATE_LIMIT', function () {
        const err = normalizePodioError(420, { error: 'rate_limit', error_description: 'rate limit' });
        expect(formatUserError(err)).to.include('platform will retry automatically');
    });

    it('returns a safe fallback for null/undefined input', function () {
        expect(formatUserError(null)).to.equal('Unknown error');
        expect(formatUserError(undefined)).to.equal('Unknown error');
    });
});
