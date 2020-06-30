var MongoClient = require('mongodb').MongoClient,
    f = require('util').format,
    fs = require('fs');

const assert = require('assert');

var ca = [fs.readFileSync(__dirname + "/lib/ssl/ca.pem")];

module.exports =  async function verify(credentials, cb) {
    console.log(JSON.stringify(credentials));

    var options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        sslValidate:true,
        sslCA:ca
    };

    const uri ="mongodb://" + ${credentials.username} + ":" + ${credentials.password} + "@mongo-0.kubernetes.thatapp.io,mongo-1.kubernetes.thatapp.io,mongo-2.kubernetes.thatapp.io:27017/?authSource="+${credentials.db_admin}+"&replicaSet=mongodb-replicaset-operator&readPreference=secondaryPreferred&ssl=true";
    console.log(uri);

    await MongoClient.connect(uri, options,function(err, client) {
        console.log(err);
        console.log("Connected successfully to server");
    });

    return cb(null, { verified: true });
};

