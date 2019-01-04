const fs = require("fs");
const path = require("path");

function defaultTask(cb) {
  cb();
}

function createLicense(cb) {
  const pkgPath = path.join(__dirname, "package.json");
  fs.readFile(pkgPath, (err, data) => {
    if (!err) {
      const pkgJSON = JSON.parse(data);
      let license = fs.readFileSync(path.join(__dirname, "LICENSE")) + "\n";
      for (dep in pkgJSON.dependencies) {
        const depDir = path.join(__dirname, "node_modules/" + dep);
        const depFiles = fs.readdirSync(depDir);
        depFiles.forEach(file => {
          if (file.toLowerCase().includes("license")) {
            const depLicense = path.join(depDir, file);
            const props = fs.lstatSync(depLicense);
            if (props.isFile()) {
              console.log(`Found ${dep} LICENSE file (${file})`);
              license += `\n==== ${dep.toUpperCase()} ====\n`;
              license += fs.readFileSync(depLicense);
            }
          }
        });
      }
      for (dep in pkgJSON.devDependencies) {
        const depDir = path.join(__dirname, "node_modules/" + dep);
        const depFiles = fs.readdirSync(depDir);
        depFiles.forEach(file => {
          if (file.toLowerCase().includes("license")) {
            const depLicense = path.join(depDir, file);
            const props = fs.lstatSync(depLicense);
            if (props.isFile()) {
              console.log(`Found ${dep} LICENSE file (${file})`);
              license += `==== ${dep.toUpperCase()} ====\n`;
              license += fs.readFileSync(depLicense) + "\n";
            }
          }
        });
      }
      const licensePath = path.join(__dirname, "bin" + path.sep + "LICENSES.txt");
      fs.writeFileSync(licensePath, license);
    }
    cb();
  });
}

exports.default = defaultTask;
exports.license = createLicense;