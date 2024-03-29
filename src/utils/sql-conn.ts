/*
 * We do not touch this for even I do not know exactly how it works.
 * So just leave it as is.
 * Because the you may no longer be able to access the DB if you do change it :).
 */
import mysql from "mysql2/promise";
import logger from "./logger";
import * as dotenv from "dotenv";
dotenv.config();

if (
  process.env.MYSQL_HOST === undefined ||
  process.env.MYSQL_USER === undefined ||
  process.env.MYSQL_PASS === undefined ||
  process.env.MYSQL_DATABASE === undefined ||
  process.env.MYSQL_IS_SERVER === undefined
) {
  throw new Error(
    "Not enough database credentials provided in environment variables or .env file"
  );
}

let isServer: boolean;

if (process.env.MYSQL_IS_SERVER === "true") {
  isServer = true;
} else {
  isServer = false;
}
const pool: mysql.Pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  isServer: isServer,
});

pool
  .getConnection()
  .then((conn) => {
    logger.info("DB: Connected to database");
    conn.release();
  })
  .catch((err) => {
    logger.error("DB: " + err);
  });

export default pool as mysql.Pool;
