const Podio = require('../../../podio');

module.exports =  async function verify(credentials, cb) {
   
    console.log(JSON.stringify(credentials));
    
    return cb(null, { verified: true });
};

