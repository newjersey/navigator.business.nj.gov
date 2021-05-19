const util = require("util");
const {exec} = require("child_process");
const cmd = util.promisify(exec);

module.exports = async () => {
  if (!process.env.SKIP_DB_SETUP) {
    await cmd("psql -c 'drop database businesstest;' -U postgres -h localhost -p 5432");
  }
}