const fs = require("fs");
const path = require("path");
const findRoot = require("find-root");

const projectDir = findRoot();
const pkgPath = path.join(projectDir, "package.json");

fs.readFile(pkgPath, (err, data) => {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  const pkgJSON = JSON.parse(data + "");
  let license = fs.readFileSync(path.join(projectDir, "LICENSE")) + "\n";
  for (const dep in pkgJSON.dependencies) {
    const depDir = path.join(projectDir, "node_modules/" + dep);
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
  for (const dep in pkgJSON.devDependencies) {
    const depDir = path.join(projectDir, "node_modules/" + dep);
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
  const licensePath = path.join(projectDir, "bin" + path.sep + "LICENSES.txt");
  fs.writeFileSync(licensePath, license);
});
