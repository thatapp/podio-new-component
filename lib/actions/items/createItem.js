const Podio = require("../../../podio");
const { messages } = require("elasticio-node");
const _ = require("lodash");
const helper = require("../../../helpers/itemHelper");
const outScheme = helper.outScheme();

exports.process = async function createItem(msg, cfg) {
  const that = this;
  try {
    let item = msg.body;

    this.logger.info('"Create Iitem" action started...');
    this.logger.info(JSON.stringify(item));

    const podio = new Podio(cfg);
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
    const items = await podio.post(url, fields);
    await that.emit("data", messages.newMessageWithBody(items));
    this.logger.info('"Create Iitem" action complete...');
  } catch (error) {
      this.logger.info("Create Iitem Error");
      this.logger.info(error);
      this.logger.info(JSON.stringify(error.stack));
    await that.emit("data", messages.newMessageWithBody(error));
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
