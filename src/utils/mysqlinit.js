const mysql = require('mysql2');
const {mysqlsecret}= require('../../secrets.json');
const logger = require("./logger")


const pool = mysql.createPool(mysqlsecret);

pool.getConnection(function(err, connection) {
    logger.info("Connected to db!")
    pool.releaseConnection(connection);
});
  

pool.on('error', function(err) {
    console.log(err.code);
  });

const promisePool = pool.promise();
  // query database using promises


module.exports = promisePool
