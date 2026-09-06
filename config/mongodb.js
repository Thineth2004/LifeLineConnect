const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

let database = null;

async function connectMongoDB() {
    await client.connect();

    database = client.db('lifeline_connect');

    console.log('MongoDB connected successfully');

    return database;
}

function getDatabase() {
    return database;
}

module.exports = {
    connectMongoDB,
    getDatabase
};