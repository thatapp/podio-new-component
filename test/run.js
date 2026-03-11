#!/usr/bin/env node
/**
 * Local test runner for podio-component actions.
 * Mimics the elastic.io runtime: creates a mock context, calls process(),
 * and prints emitted data/errors to stdout.
 *
 * Usage:
 *   node test/run.js <action-path> [fixture-name]
 *
 * Examples:
 *   node test/run.js lib/actions/items/updateItem      updateItem
 *   node test/run.js lib/actions/all/searchApp         searchApp
 *   node test/run.js lib/actions/items/filterItembyView filterItembyView
 *
 * If no fixture name is given, it looks for a matching key in test/fixtures/<action-name>.json
 * or falls back to test/fixture.json.
 *
 * Credentials are loaded from test/.env (never committed).
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Load local .env for credentials
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    console.warn('[runner] No test/.env file found — credentials must be in the fixture cfg.');
}

const actionPath = process.argv[2];
const fixtureName = process.argv[3];

if (!actionPath) {
    console.error('Usage: node test/run.js <action-path> [fixture-name]');
    console.error('  e.g. node test/run.js lib/actions/items/updateItem updateItem');
    process.exit(1);
}

// Resolve action module
const fullActionPath = path.resolve(process.cwd(), actionPath);
let action;
try {
    action = require(fullActionPath);
} catch (e) {
    console.error(`[runner] Failed to load action: ${fullActionPath}`);
    console.error(e.message);
    process.exit(1);
}

// Load fixture
let fixture = null;
const actionName = path.basename(actionPath);

// Try dedicated fixture file first: test/fixtures/<actionName>.json
const dedicatedFixture = path.join(__dirname, 'fixtures', `${actionName}.json`);
if (fs.existsSync(dedicatedFixture)) {
    fixture = JSON.parse(fs.readFileSync(dedicatedFixture, 'utf8'));
} else {
    // Fall back to test/fixture.json
    const sharedFixture = path.join(__dirname, 'fixture.json');
    if (fs.existsSync(sharedFixture)) {
        const all = JSON.parse(fs.readFileSync(sharedFixture, 'utf8'));
        fixture = fixtureName ? (all.fixtures?.[fixtureName] || all[fixtureName] || all) : all;
    }
}

if (!fixture || (!fixture.msg && !fixture.body)) {
    console.error(`[runner] No fixture found for '${actionName}'. Create test/fixtures/${actionName}.json`);
    process.exit(1);
}

const msg = fixture.msg || { body: fixture.body || {} };
const cfg = fixture.cfg || {};

// Inject env credentials into cfg if not already set
if (!cfg.oauth && process.env.PODIO_ACCESS_TOKEN) {
    cfg.oauth = {
        access_token: process.env.PODIO_ACCESS_TOKEN,
        refresh_token: process.env.PODIO_REFRESH_TOKEN,
        token_type: 'bearer'
    };
}
if (!cfg.appId && process.env.PODIO_APP_ID) {
    cfg.appId = parseInt(process.env.PODIO_APP_ID);
}
if (!cfg._account && process.env.PODIO_ACCOUNT_ID) {
    cfg._account = process.env.PODIO_ACCOUNT_ID;
}

// Build mock elastic.io context
let emitCount = 0;
const context = {
    logger: {
        info: (...args) => console.log('[INFO]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        debug: (...args) => console.log('[DEBUG]', ...args),
    },
    emit: async function(event, data) {
        emitCount++;
        if (event === 'data') {
            console.log(`\n[emit:data #${emitCount}]`, JSON.stringify(data?.body ?? data, null, 2));
        } else if (event === 'error') {
            console.error(`\n[emit:error]`, data?.message || data);
        } else {
            console.log(`\n[emit:${event}]`, JSON.stringify(data, null, 2));
        }
    }
};

console.log(`\n[runner] Running action: ${actionPath}`);
console.log(`[runner] msg.body keys: ${Object.keys(msg.body || {}).join(', ')}`);
console.log(`[runner] cfg keys: ${Object.keys(cfg).join(', ')}\n`);

// Run the action
action.process.call(context, msg, cfg)
    .then(() => {
        console.log(`\n[runner] Done. Total emissions: ${emitCount}`);
    })
    .catch((err) => {
        console.error('\n[runner] Unhandled error:', err.message || err);
        process.exit(1);
    });
