const util = require("util");
const {exec} = require("child_process");
const cmd = util.promisify(exec);

module.exports = async () => {
  if (!process.env.SKIP_DB_SETUP) {
    await cmd("psql -c 'drop database if exists businesstest;' -U postgres -h localhost -p 5432");
    await cmd("psql -c 'create database businesstest;' -U postgres -h localhost -p 5432");
    await cmd("npm run db-migrate up -- -e test");
  }
};
