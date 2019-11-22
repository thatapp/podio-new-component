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
    const { SpaceId } = cfg;

    if (!SpaceId) {
        throw new Error('Space Id field is required');
      }
    
    podio.get('/space/' + SpaceId)
        .then(handleSpace)
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));


    function handleSpace(space) {
        messages.emitSnapshot.call(that, space);
    };

    function asObject(v) {
        return {value: v};
    }
}


