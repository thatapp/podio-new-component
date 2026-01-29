const Podio = require("../../../podio");
const { messages } = require("elasticio-node");
const _ = require("lodash");
const helper = require("../../../helpers/itemHelper");
const outScheme = helper.outScheme();

/**
 * Parse category field error from Podio API response
 * Returns { fieldExternalId, missingValue } if category error detected, null otherwise
 */
function parseCategoryError(error) {
  try {
    // Podio returns errors like: "Field 'field_name' does not have option 'value'"
    // or error.error_parameters may contain field info
    const errorMsg = error.message || error.error_description || '';

    // Pattern: Field with external_id 'xxx' does not have option 'yyy'
    const pattern1 = /field.*?['"]([^'"]+)['"].*?does not have option.*?['"]([^'"]+)['"]/i;
    // Pattern: Invalid value for category field
    const pattern2 = /invalid.*?value.*?['"]([^'"]+)['"].*?field.*?['"]([^'"]+)['"]/i;

    let match = errorMsg.match(pattern1);
    if (match) {
      return { fieldExternalId: match[1], missingValue: match[2] };
    }

    match = errorMsg.match(pattern2);
    if (match) {
      return { fieldExternalId: match[2], missingValue: match[1] };
    }

    // Check error_parameters if available
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
 * @param {Podio} podio - Podio API client
 * @param {string} appId - Application ID
 * @param {string} fieldExternalId - Field external ID or field ID
 * @param {string} missingValue - The category value to add
 * @param {object} logger - Logger instance
 */
async function addMissingCategoryOption(podio, appId, fieldExternalId, missingValue, logger) {
  try {
    // Get the app to find the field configuration
    const app = await podio.get(`/app/${appId}`);

    // Find the field by external_id or field_id
    const field = app.fields.find(f =>
      f.external_id === fieldExternalId ||
      String(f.field_id) === String(fieldExternalId) ||
      f.label.toLowerCase() === fieldExternalId.toLowerCase()
    );

    if (!field) {
      logger.info(`Field '${fieldExternalId}' not found in app ${appId}`);
      return false;
    }

    if (field.type !== 'category') {
      logger.info(`Field '${fieldExternalId}' is not a category field (type: ${field.type})`);
      return false;
    }

    // Get current options
    const currentOptions = field.config.settings.options || [];

    // Check if option already exists (case-insensitive)
    const optionExists = currentOptions.some(opt =>
      opt.text.toLowerCase() === missingValue.toLowerCase()
    );

    if (optionExists) {
      logger.info(`Option '${missingValue}' already exists in field '${fieldExternalId}'`);
      return true;
    }

    // Add the new option
    const newOptions = [...currentOptions, { text: missingValue, color: 'DCEBD8' }];

    // Update the field configuration
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
    logger.info(`Successfully added category option '${missingValue}' to field '${fieldExternalId}'`);

    return true;
  } catch (e) {
    logger.info(`Failed to add category option: ${e.message}`);
    return false;
  }
}

/**
 * Attempt to detect and fix category errors from input data
 * This scans the input for category fields and tries to add any missing options
 */
async function autoAddCategoryOptionsFromInput(podio, appId, inputData, logger) {
  try {
    const app = await podio.get(`/app/${appId}`);
    const categoryFields = app.fields.filter(f => f.type === 'category');

    for (const field of categoryFields) {
      const fieldKey = field.external_id || String(field.field_id);
      const inputValue = inputData[fieldKey] || inputData[field.field_id];

      if (!inputValue) continue;

      // Handle both single values and arrays
      const values = Array.isArray(inputValue) ? inputValue : [inputValue];
      const currentOptions = field.config.settings.options || [];

      for (const val of values) {
        // Extract text value if it's an object
        const textValue = typeof val === 'object' ? (val.text || val.value) : val;
        if (!textValue || typeof textValue !== 'string') continue;

        // Check if option exists
        const optionExists = currentOptions.some(opt =>
          opt.text.toLowerCase() === textValue.toLowerCase()
        );

        if (!optionExists) {
          logger.info(`Auto-adding missing category option '${textValue}' to field '${field.label}'`);
          await addMissingCategoryOption(podio, appId, fieldKey, textValue, logger);
          // Refresh the options list
          currentOptions.push({ text: textValue });
        }
      }
    }

    return true;
  } catch (e) {
    logger.info(`Auto-add category options scan failed: ${e.message}`);
    return false;
  }
}

exports.process = async function createItem(msg, cfg) {
  const that = this;
  try {
    let item = msg.body;

    this.logger.info('"Create Item" action started...');
    this.logger.info(JSON.stringify(item));

    const podio = new Podio(cfg);

    // If autoAddCategoryOptions is enabled, scan and add missing options before attempting create
    if (cfg.autoAddCategoryOptions) {
      this.logger.info('Auto-add category options enabled, scanning input...');
      await autoAddCategoryOptionsFromInput(podio, cfg.appId, item, this.logger);
    }

    var item_remodified = await reformData(item, podio);

    const data = helper.fieldTransform(item_remodified);
    for (const key of Object.keys(data)) {
      if (data[key].start_date !== "undefined") {
        var start_date = data[key].start_date;
        if (Array.isArray(start_date)) {
          if (start_date.length == 0) {
            data[key] = [];
          }
        } else if (typeof start_date === "string") {
          if (start_date == "[]") {
            data[key] = [];
          }
        }
      }
      if (data[key].start !== "undefined") {
        var start = data[key].start;
        if (Array.isArray(start)) {
          if (start.length == 0) {
            data[key] = [];
          }
        } else if (typeof start === "string") {
          if (start == "[]") {
            data[key] = [];
          }
        }
      }
      if (data[key].end !== "undefined") {
        var end = data[key].end;
        if (Array.isArray(end)) {
          if (end.length == 0) {
            data[key] = [];
          }
        } else if (typeof end === "string") {
          if (end == "[]") {
            data[key] = [];
          }
        }
      }
    }

    this.logger.info("Formatted item data");
    this.logger.info(JSON.stringify(data));

    //check for the field with type Link
    const fields = {};
    fields.fields = data;
    var url = `/item/app/${cfg.appId}?silent=${cfg.silent ? 1 : 0}&hook=${
      cfg.hook ? 1 : 0
    }`;

    let items;
    let retryAttempted = false;

    try {
      items = await podio.post(url, fields);
    } catch (createError) {
      // If autoAddCategoryOptions is enabled and we get a category error, try to fix and retry
      if (cfg.autoAddCategoryOptions && !retryAttempted) {
        const categoryError = parseCategoryError(createError);
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
            this.logger.info('Retrying item creation after adding missing category option...');
            retryAttempted = true;
            items = await podio.post(url, fields);
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

    await that.emit("data", messages.newMessageWithBody(items));
    this.logger.info('"Create Item" action complete...');
  } catch (error) {
      this.logger.info("Create Item Error");
      this.logger.info(error);
      this.logger.info(JSON.stringify(error.stack));
    await that.emit("error", error);
  }
};

reformData = async function (item, podio) {
  for (const key of Object.keys(item)) {
    if (typeof item[key] === "object") {
      if (typeof item[key].embed !== "undefined") {
        const data = {
          url: item[key].embed,
        };
        const resolvedUrl = await podio.post("/embed/", data);
        item[key].embed = resolvedUrl.embed_id;
      }
    }
  }
  return item;
};

exports.getMetaModel = function getMetaModel(cfg, cb) {
  const podio = new Podio(cfg, this);
  podio
    .get("/app/" + cfg.appId)
    .then(getSchema)
    .fail(cb)
    .done();

  function getSchema(app) {
    let itemProperties = {
      external_id: {
        type: "string",
        required: false,
        title: "External ID",
      },
    };
    return helper.proccessAll(app, helper, itemProperties, cb, outScheme);
  }
};
