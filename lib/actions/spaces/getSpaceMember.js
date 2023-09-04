const Podio = require("../../../podio");
const e = require("../../../helpers/elasticoHelper");
const helper = require("../../../helpers/itemHelper");

exports.process = async function getSpaceMember(msg, cfg) {
  const that = this;
  const podio = new Podio(cfg);
  const data = msg.body;

  let fields = {};
  fields.space_id = data.space_id;
  fields.user_id = data.user_id;

  var spaceMember = await podio
    .get("/space/" + data.space_id + "/member/" + data.user_id + "/v2")
    .fail(e.handleFailed(this));

  helper.emitData(cfg, spaceMember, that);
};
