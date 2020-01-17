var request = require('request');
var API_URL = 'https://api.podio.com';
var Podio = require('../../../podio');
const { messages } = require('elasticio-node');
var _ = require('lodash');

exports.process = processTrigger;

function processTrigger(msg, cfg, next, snapshot) {
    var that = this;
    var podio = new Podio(cfg);

    podio.get('/contact/')
        .then(handleContacts)
        .fail(messages.emitError.bind(this))
        .done(messages.emitEnd.bind(this));


    function handleContacts(contacts) {
        contacts.forEach(function(contact) {
            contact = format(contact);
            var hash = crypt.getHash(_.omit(contact, 'last_seen_on'));
            if (snapshot[contact.user_id] !== hash) {
                snapshot[contact.user_id] = hash;
                messages.emitData.call(that, contact);
            }
        });
        messages.emitSnapshot.call(that, snapshot);
    };

    function format(contact) {
        var fields = ['rights', 'url', 'phone', 'mail', 'title'];

        fields.forEach(makeObject);

        function makeObject(field) {
            if (contact[field]) {
                contact[field] = contact[field].map(asObject)
            }
        }
        return contact;
    }
    function asObject(v) {
        return {value: v};
    }
}
