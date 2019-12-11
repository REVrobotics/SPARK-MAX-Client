
function protoToFileName(name, suffix = "", withExtension = true) {
  return name.replace(".proto", `${suffix ? "_" + suffix : ""}_pb${withExtension ? ".ts" : ""}`);
}

module.exports = {
  protoToFileName,
};
