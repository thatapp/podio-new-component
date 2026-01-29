'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Parse category field error from Podio API response
 * Returns { fieldExternalId, missingValue } if category error detected, null otherwise
 */
function parseCategoryError(error) {
    try {
        const errorMsg = error.message || error.error_description || '';
        const pattern1 = /field.*?['"]([^'"]+)['"].*?does not have option.*?['"]([^'"]+)['"]/i;
        const pattern2 = /invalid.*?value.*?['"]([^'"]+)['"].*?field.*?['"]([^'"]+)['"]/i;

        let match = errorMsg.match(pattern1);
        if (match) {
            return { fieldExternalId: match[1], missingValue: match[2] };
        }

        match = errorMsg.match(pattern2);
        if (match) {
            return { fieldExternalId: match[2], missingValue: match[1] };
        }

        if (error.error_parameters && error.error_parameters.field_external_id) {
            return {
                fieldExternalId: error.error_parameters.field_external_id,
                missingValue: error.error_parameters.value || error.error_parameters.option
            };
        }

        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Add missing category option to app field
 */
async function addMissingCategoryOption(podio, appId, fieldExternalId, missingValue) {
    try {
        const app = await podio.get(`/app/${appId}`);
        const field = app.fields.find(f =>
            f.external_id === fieldExternalId ||
            String(f.field_id) === String(fieldExternalId) ||
            f.label.toLowerCase() === fieldExternalId.toLowerCase()
        );

        if (!field || field.type !== 'category') {
            return false;
        }

        const currentOptions = field.config.settings.options || [];
        const optionExists = currentOptions.some(opt =>
            opt.text.toLowerCase() === missingValue.toLowerCase()
        );

        if (optionExists) {
            return true;
        }

        const newOptions = [...currentOptions, { text: missingValue, color: 'DCEBD8' }];
        const updatePayload = {
            config: {
                ...field.config,
                settings: {
                    ...field.config.settings,
                    options: newOptions
                }
            }
        };

        await podio.put(`/app/${appId}/field/${field.field_id}`, updatePayload);
        console.log(`Added category option '${missingValue}' to field '${fieldExternalId}'`);
        return true;
    } catch (e) {
        console.error(`Failed to add category option: ${e.message}`);
        return false;
    }
}

/**
 * Scan input fields and auto-add any missing category options
 */
async function autoAddCategoryOptionsFromInput(podio, appId, fieldsData) {
    try {
        const app = await podio.get(`/app/${appId}`);
        const categoryFields = app.fields.filter(f => f.type === 'category');

        for (const field of categoryFields) {
            const fieldKey = field.external_id || String(field.field_id);
            const inputValue = fieldsData[fieldKey] || fieldsData[field.field_id];

            if (!inputValue) continue;

            const values = Array.isArray(inputValue) ? inputValue : [inputValue];
            const currentOptions = field.config.settings.options || [];

            for (const val of values) {
                const textValue = typeof val === 'object' ? (val.text || val.value) : val;
                if (!textValue || typeof textValue !== 'string') continue;

                const optionExists = currentOptions.some(opt =>
                    opt.text.toLowerCase() === textValue.toLowerCase()
                );

                if (!optionExists) {
                    console.log(`Auto-adding missing category option '${textValue}' to field '${field.label}'`);
                    await addMissingCategoryOption(podio, appId, fieldKey, textValue);
                    currentOptions.push({ text: textValue });
                }
            }
        }
        return true;
    } catch (e) {
        console.error(`Auto-add category options scan failed: ${e.message}`);
        return false;
    }
}

/**
 * Create Item (Dynamic/Raw)
 * POST /item/app/{app_id}/
 *
 * Advanced endpoint for creating items where the app_id and fields payload
 * are passed dynamically from previous steps. No schema lookup is performed.
 *
 * This allows:
 * - Dynamic routing to different apps based on incoming data
 * - Creating items in any app with a single workflow step
 * - Full control over the payload structure
 *
 * The user is responsible for ensuring the fields payload matches the target app's schema.
 */
exports.process = async function createItemDynamic(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const input = msg.body;

    // Get app_id from msg.body (dynamic) or fall back to cfg (static)
    const appId = input.app_id || input.appId || input.AppId || cfg.appId;

    if (!appId) {
        throw new Error('app_id is required');
    }

    if (!input.fields) {
        throw new Error('fields is required (object with field external_ids or field_ids as keys)');
    }

    try {
        // If autoAddCategoryOptions is enabled, scan and add missing options before attempting create
        const autoAddEnabled = input.autoAddCategoryOptions !== undefined
            ? input.autoAddCategoryOptions
            : cfg.autoAddCategoryOptions;

        if (autoAddEnabled) {
            console.log('Auto-add category options enabled, scanning input...');
            await autoAddCategoryOptionsFromInput(podio, appId, input.fields);
        }

        // Build the payload
        const payload = {
            fields: input.fields
        };

        // Optional: external_id for the item
        if (input.external_id) {
            payload.external_id = input.external_id;
        }

        // Optional: tags
        if (input.tags) {
            payload.tags = input.tags;
        }

        // Optional: reminder
        if (input.reminder) {
            payload.reminder = input.reminder;
        }

        // Optional: recurrence
        if (input.recurrence) {
            payload.recurrence = input.recurrence;
        }

        // Optional: linked_account_id (for meetings)
        if (input.linked_account_id) {
            payload.linked_account_id = input.linked_account_id;
        }

        // Optional: ref (reference to copy files/tasks from)
        if (input.ref) {
            payload.ref = input.ref;
        }

        // Build URL with query params
        const hook = (input.hook !== undefined ? input.hook : cfg.hook) !== false ? 1 : 0;
        const silent = (input.silent !== undefined ? input.silent : cfg.silent) === true ? 1 : 0;
        const url = `/item/app/${appId}/?hook=${hook}&silent=${silent}`;

        console.log(`Creating item in app ${appId} (dynamic mode)`);
        console.log('Payload:', JSON.stringify(payload));

        let item;
        let retryAttempted = false;

        try {
            item = await podio.post(url, payload);
        } catch (createError) {
            // If autoAddCategoryOptions is enabled and we get a category error, try to fix and retry
            if (autoAddEnabled && !retryAttempted) {
                const categoryError = parseCategoryError(createError);
                if (categoryError && categoryError.fieldExternalId && categoryError.missingValue) {
                    console.log(`Category error detected: field='${categoryError.fieldExternalId}', missing='${categoryError.missingValue}'`);

                    const added = await addMissingCategoryOption(
                        podio,
                        appId,
                        categoryError.fieldExternalId,
                        categoryError.missingValue
                    );

                    if (added) {
                        console.log('Retrying item creation after adding missing category option...');
                        retryAttempted = true;
                        item = await podio.post(url, payload);
                    } else {
                        throw createError;
                    }
                } else {
                    throw createError;
                }
            } else {
                throw createError;
            }
        }

        helper.emitData(cfg, item, that);
    } catch (error) {
        console.error('createItemDynamic failed:', error.message || error);
        await that.emit('error', error);
    }
};

// No getMetaModel - this is intentional for dynamic/raw mode
