'use strict';

const { expect } = require('chai');
const { redactSensitive, safeStringify, SENSITIVE_KEYS } = require('../../../helpers/redact');

describe('helpers/redact.redactSensitive', function () {

    it('masks every documented sensitive key', function () {
        const input = {
            access_token: 'aaa', refresh_token: 'rrr',
            mailbox: 'seth.96784aaa',
            calendar_code: 'KE5RHRMMHH6w',
            referral: { code: 'avpNU8Zv' },
            push: { channel: '/space/1', signature: 'hmac', timestamp: 1, expires_in: 21600 },
            presence: { user_id: 28918, ref_id: 1, ref_type: 'space', signature: 'pres-sig' },
            normal_field: 'visible',
        };
        const out = redactSensitive(input);

        for (const key of SENSITIVE_KEYS) {
            if (input[key] !== undefined) {
                expect(out[key], `expected ${key} to be masked`).to.equal('[REDACTED]');
            }
        }
        expect(out.normal_field).to.equal('visible');
    });

    it('does not mutate the input', function () {
        const input = { access_token: 'aaa', body: 'ok' };
        redactSensitive(input);
        expect(input.access_token).to.equal('aaa');
        expect(input.body).to.equal('ok');
    });

    it('recurses into nested objects', function () {
        const out = redactSensitive({
            outer: { inner: { mailbox: 'leaky.xxxx', preserved: 1 } }
        });
        expect(out.outer.inner.mailbox).to.equal('[REDACTED]');
        expect(out.outer.inner.preserved).to.equal(1);
    });

    it('recurses into arrays', function () {
        const out = redactSensitive([
            { calendar_code: 'cc', name: 'one' },
            { calendar_code: 'cc2', name: 'two' },
        ]);
        expect(out[0].calendar_code).to.equal('[REDACTED]');
        expect(out[0].name).to.equal('one');
        expect(out[1].calendar_code).to.equal('[REDACTED]');
    });

    it('passes primitives through', function () {
        expect(redactSensitive('hello')).to.equal('hello');
        expect(redactSensitive(42)).to.equal(42);
        expect(redactSensitive(null)).to.equal(null);
        expect(redactSensitive(undefined)).to.equal(undefined);
    });
});

describe('helpers/redact.safeStringify', function () {

    it('round-trips a redacted JSON string', function () {
        const json = safeStringify({ access_token: 'aaa', visible: 'ok' });
        const parsed = JSON.parse(json);
        expect(parsed.access_token).to.equal('[REDACTED]');
        expect(parsed.visible).to.equal('ok');
    });

    it('survives circular structures with a fallback', function () {
        const a = {};
        a.self = a;
        const out = safeStringify(a);
        expect(out).to.equal('[unserializable]');
    });
});
