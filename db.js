const mongo = require('mongodb').MongoClient;
const mongoConfig = {
    host: '52.66.18.67',
    authDb: 'moocrec-v2',
    user: 'user',
    password: 'password',
    port: '27017'
}

const connectionUrl = `mongodb://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/?authSource=${mongoConfig.authDb}`;
const databaseName = 'moocrec-v2';

// Establish a singleton MongoDB connection.
let db = null;

mongo.connect(connectionUrl, (err, client) => {
    if (err) {
        console.error(err);
        db = null;
        return;
    }
    else if (!db) {
        db = client.db(databaseName);
    }
})

let getCollection = (collectionName => {
    return db ? db.collection(collectionName) : null;
})

module.exports = { getCollection };