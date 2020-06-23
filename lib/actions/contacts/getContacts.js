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


    function handleContacts(contacts,cfg) {
        // contacts.forEach(function(contact) {
        //     contact = format(contact);
        //     var hash = crypt.getHash(_.omit(contact, 'last_seen_on'));
        //     if (snapshot[contact.user_id] !== hash) {
        //         snapshot[contact.user_id] = hash;
        //         messages.emitData.call(that, contact);
        //     }
        // });

        if (cfg.splitResult && Array.isArray(contacts)) {
            for (const i_item of contacts) {
                const output = messages.newMessageWithBody(i_item);
                that.emit('data', output);
            }
            that.emit('end');
        } else {
            that.emit('data', messages.newMessageWithBody(contacts));
        }
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
