const findRoot = require("find-root");
const fs = require("fs");

const {NODE_ENV} = process.env;
const projectDir = findRoot();

const dotenvPath = `${projectDir}/.env`;

const dotenvFiles = [
  dotenvPath,
  `${dotenvPath}.local`,
  `${dotenvPath}.${NODE_ENV}`,
  `${dotenvPath}.${NODE_ENV}.local`,
].filter(Boolean);

const exported = dotenvFiles.reduce((env, dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    let parsed = require('dotenv').parse(fs.readFileSync(dotenvFile));
    parsed = require('dotenv-expand')({ignoreProcessEnv: true, parsed});
    env = {...env, ...parsed.parsed};
  }
  return env;
}, {});

module.exports = exported;
