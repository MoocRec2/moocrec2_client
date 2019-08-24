const mongo = require('mongodb').MongoClient;
const connectionUrl = 'mongodb://localhost:27017';
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