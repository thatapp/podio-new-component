const Podio = require('../podio');

exports.getOrganisations = async (cfg, cb) => {
    let that = this;
    const podio = new Podio(cfg, this);

    const orgs = await podio.get('/org/');

    let result = {};
    orgs.forEach(function (value, key) {
        result[value.org_id] = value.name;
    });

    return JSON.parse(JSON.stringify(result));
};