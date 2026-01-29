const Podio = require('../../../podio');
const { messages } = require('elasticio-node');
const helper = require('../../../helpers/itemHelper');
const outScheme = helper.outScheme();

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
async function addMissingCategoryOption(podio, appId, fieldExternalId, missingValue, logger) {
    try {
        const app = await podio.get(`/app/${appId}`);
        const field = app.fields.find(f =>
            f.external_id === fieldExternalId ||
            String(f.field_id) === String(fieldExternalId) ||
            f.label.toLowerCase() === fieldExternalId.toLowerCase()
        );

        if (!field || field.type !== 'category') {
            if (logger) logger.info(`Field '${fieldExternalId}' not found or not a category field`);
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
        if (logger) logger.info(`Added category option '${missingValue}' to field '${fieldExternalId}'`);
        return true;
    } catch (e) {
        if (logger) logger.info(`Failed to add category option: ${e.message}`);
        return false;
    }
}

/**
 * Scan input fields and auto-add any missing category options
 */
async function autoAddCategoryOptionsFromInput(podio, appId, inputData, logger) {
    try {
        const app = await podio.get(`/app/${appId}`);
        const categoryFields = app.fields.filter(f => f.type === 'category');

        for (const field of categoryFields) {
            const fieldKey = field.external_id || String(field.field_id);
            const inputValue = inputData[fieldKey] || inputData[field.field_id];

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
                    if (logger) logger.info(`Auto-adding missing category option '${textValue}' to field '${field.label}'`);
                    await addMissingCategoryOption(podio, appId, fieldKey, textValue, logger);
                    currentOptions.push({ text: textValue });
                }
            }
        }
        return true;
    } catch (e) {
        if (logger) logger.info(`Auto-add category options scan failed: ${e.message}`);
        return false;
    }
}

exports.process = async function updateItem(msg, cfg) {
    const that = this;
    try {
        const item = msg.body;
        const item_id = msg.body.item_id;
        if (!item_id) {
            throw new Error('Item_id field is required');
        }
        const podio = new Podio(cfg);

        // If autoAddCategoryOptions is enabled, scan and add missing options before attempting update
        if (cfg.autoAddCategoryOptions) {
            this.logger.info('Auto-add category options enabled, scanning input...');
            await autoAddCategoryOptionsFromInput(podio, cfg.appId, item, this.logger);
        }

        var item_remodified = await reformData(item, podio);

        let data = helper.fieldTransform(item_remodified, true);

        delete data["item_id"];

        const fields = {};

        // Checking if any of the data is null
        for (let property in data) {
            if (data[property] == null || data[property] == "null") {
                delete data[property];
            }

            if(data[property].start_date !== "undefined"){
                var start_date = data[property].start_date;
                if(Array.isArray(start_date)) {
                    if (start_date.length == 0) {
                        data[property] = [];
                    }
                }else if(typeof start_date === 'string'){
                    if (start_date == "[]") {
                        data[property] = [];
                    }
                }

            }
            if(data[property].start !== "undefined"){
                var start = data[property].start;
                if(Array.isArray(start)) {
                    if (start.length == 0) {
                        data[property] = [];
                    }
                }else if(typeof start === 'string'){
                    if (start == "[]") {
                        data[property] = [];
                    }
                }

            }
            if(data[property].end !== "undefined"){
                var end = data[property].end;
                if(Array.isArray(end)) {
                    if (end.length == 0) {
                        data[property] = [];
                    }
                }else if(typeof end === 'string'){
                    if (end == "[]") {
                        data[property] = [];
                    }
                }

            }
        }

        // fields.fields = data;
        delete data["appId"];
        fields.fields = data;
        var url = `/item/${item_id}?silent=${cfg.silent ? 1 : 0}&hook=${cfg.hook ? 1 : 0}`;

        let data_;
        let retryAttempted = false;

        try {
            data_ = await podio.put(url, fields);
        } catch (updateError) {
            // If autoAddCategoryOptions is enabled and we get a category error, try to fix and retry
            if (cfg.autoAddCategoryOptions && !retryAttempted) {
                const categoryError = parseCategoryError(updateError);
                if (categoryError && categoryError.fieldExternalId && categoryError.missingValue) {
                    this.logger.info(`Category error detected: field='${categoryError.fieldExternalId}', missing='${categoryError.missingValue}'`);

                    const added = await addMissingCategoryOption(
                        podio,
                        cfg.appId,
                        categoryError.fieldExternalId,
                        categoryError.missingValue,
                        this.logger
                    );

                    if (added) {
                        this.logger.info('Retrying item update after adding missing category option...');
                        retryAttempted = true;
                        data_ = await podio.put(url, fields);
                    } else {
                        throw updateError;
                    }
                } else {
                    throw updateError;
                }
            } else {
                throw updateError;
            }
        }

        var result = { response: data_ };
        await that.emit('data', messages.newMessageWithBody(result));
    } catch (error) {
        console.error('updateItem failed:', error.message || error);
        await that.emit('error', error);
    }

};


reformData = async function (item, podio) {
    for (const key of Object.keys(item)) {
        if ((typeof item[key] === "object")) {
            if (typeof item[key].embed !== 'undefined') {
                const data = {
                    url: item[key].embed
                };
                const resolvedUrl = await podio.post('/embed/', data);
                item[key].embed = resolvedUrl.embed_id
            }
        }
    }
    return item;
}


exports.getMetaModel = function getMetaModel(cfg, cb) {
    const podio = new Podio(cfg, this);
    podio.get('/app/' + cfg.appId)
        .then(getSchema)
        .fail(cb)
        .done();

    function getSchema(app) {
        let itemProperties = {
            item_id: {
                type: 'number',
                required: true,
                title: 'Item ID'
            }
        };
        return helper.proccessAll(app, helper, itemProperties, cb, outScheme);
    }
};
