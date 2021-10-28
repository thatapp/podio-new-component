const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const {messages} = require('elasticio-node');

exports.process =  async function getExportByRef(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { linked_account_id, ref_type, ref_id } = msg.body;

    if (!linked_account_id) {
        throw new Error('Linked_Account_ID field is required');
    }
    if (!ref_type) {
        throw new Error('Ref_Type field is required');
    }
    if (!ref_id) {
        throw new Error('Ref_ID field is required');
    }

    const exportbyRef = await podio.get(`/calendar/export/linked_account/${linked_account_id}/${ref_type}/${ref_id}`).fail(messages.emitError.bind(that));

    helper.emitData(cfg,exportbyRef,that);
};