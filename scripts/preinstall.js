const fs = require("fs");
const path = require("path");
const dirs = ["screenshots", "videos"];

dirs.forEach((dir) => {
  fs.existsSync(dir) || fs.mkdirSync(dir);
});
