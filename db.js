const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

async function start() {
    const client = new MongoClient(process.env.mongoURI);
    await client.connect();
    module.exports = client.db();
    require('./app').listen(process.env.PORT);
  }
  
  start();