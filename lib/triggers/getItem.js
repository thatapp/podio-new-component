var request = require('request');
var crypt = require('../../../crypt');
var API_URL = 'https://api.podio.com';
var Podio = require('../../podio');
var messages = require('./../../../messages');
var _ = require('lodash');

exports.process = processTrigger;

function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);
    const { ItemId } = cfg;

    if (!ItemId) {
        throw new Error('Item_id field is required');
      }
    
    podio.get('/item/' + ItemId)
        .then(handleItem)
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));


    function handleItem(item) {
        messages.emitSnapshot.call(that, item);
    };

    function asObject(v) {
        return {value: v};
    }
}


