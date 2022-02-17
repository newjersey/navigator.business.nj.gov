var fs = require("fs");
var path = require("path"),
  fs = require("fs");

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function build() {
  const getIndustries = fs.readdirSync("./src/roadmaps/industries/").reduce((previousValue, currentValue) => {
    previousValue.push(require(`./src/roadmaps/industries/${currentValue}`));
    return previousValue;
  }, []);
  ensureDirectoryExistence("./lib/industry.json");
  fs.writeFileSync("./lib/industry.json", JSON.stringify({ industries: getIndustries }));
}
build();
