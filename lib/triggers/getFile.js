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
    const { FileId } = cfg;

    if (!FileId) {
        throw new Error('File_id field is required');
      }
    
    podio.get('/file/' + FileId)
        .then(handleFile)
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));


    function handleFile(file) {
        messages.emitSnapshot.call(that, file);
    };

    
}


