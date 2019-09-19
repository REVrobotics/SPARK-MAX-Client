const path = require("path");
const os = require("os");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs-extra");
const findConfig = require("find-config");
const findRoot = require("find-root");
const _ = require('lodash');

const openedConfig = require("./proto-gen.config");
const secretConfig = findSecretConfigFile();
const config = _.merge({}, openedConfig, secretConfig);

const GitHub = require("github-api");

const projectDir = findRoot();

download(config.download)
  .then(() => Promise.all(config.generation.map((generationFlow) => generate(generationFlow))))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
  });

// Generates path to temporary directory
const getTempDirName = _.memoize(() => path.resolve(os.tmpdir(), String(Math.floor(Math.random() * 1000000000))));

/**
 * Generates files by .proto files
 * @param generationConfig
 */
function generate(generationConfig) {
  if (generationConfig.use === "main") {
    return generateForMain(generationConfig);
  } else {
    return generateForRenderer(generationConfig);
  }
}

/**
 * Generates only serializable data structures (DTOs) by .proto files
 * @return {Promise<unknown>}
 */
function generateForRenderer(generationConfig) {
  const dtoCmd = [
    path.resolve(projectDir, "node_modules/grpc-tools/bin/protoc"),
    // protoc TS generation plugin
    `--plugin=protoc-gen-dto=${normalizeCmdPath(path.resolve(projectDir, "scripts/protoc-dto-plugin/protoc-dto-plugin"))}`,
    // Path all internal .proto imports will be resolved upon
    generationConfig.includeDir ? `--proto_path=${resolvePath(generationConfig.includeDir)}` : '',
    // Import settings: format, destination directory
    `--dto_out=${resolvePath(generationConfig.destDir)}`,
    // Source .proto files
    ...generationConfig.path.map((p) => path.resolve(resolvePath(generationConfig.baseDir), p)),
  ];

  return fs.mkdirp(resolvePath(generationConfig.destDir))
    // Run DTO generation
    .then(() => exec(dtoCmd.join(" "), {
      env: {
        ...process.env,
        PATH: `${process.env.PATH};${path.resolve(projectDir, "node_modules/.bin")}`,
      },
    }))
    .then(() => {
      console.log("Code generation for 'renderer' process has finished successfully")
    });
}

/**
 * Generates gRPC client by .proto files
 * @return {Promise<unknown>}
 */
function generateForMain(generationConfig) {
  const grpcCmd = [
    "grpc_tools_node_protoc",
    // Path all internal .proto imports will be resolved upon
    generationConfig.includeDir ? `--proto_path=${resolvePath(generationConfig.includeDir)}` : '',
    // Import settings: format, destination directory
    `--js_out=import_style=commonjs,binary:${resolvePath(generationConfig.destDir)}`,
    // Settings for protoc-gen-grpc plugin
    `--grpc_out=${resolvePath(generationConfig.destDir)}`,
    // Source .proto files
    ...generationConfig.path.map((p) => path.resolve(resolvePath(generationConfig.baseDir), p)),
  ];

  const tsCmd = [
    path.resolve(projectDir, "node_modules/grpc-tools/bin/protoc"),
    // protoc TS generation plugin
    `--plugin=protoc-gen-ts=${normalizeCmdPath(path.resolve(projectDir, "node_modules/.bin/protoc-gen-ts"))}`,
    // Path all internal .proto imports will be resolved upon
    generationConfig.includeDir ? `--proto_path=${resolvePath(generationConfig.includeDir)}` : '',
    // Import settings: format, destination directory
    `--ts_out=${resolvePath(generationConfig.destDir)}`,
    // Source .proto files
    ...generationConfig.path.map((p) => path.resolve(resolvePath(generationConfig.baseDir), p)),
  ];

  const dtoCmd = [
    path.resolve(projectDir, "node_modules/grpc-tools/bin/protoc"),
    // protoc TS generation plugin
    `--plugin=protoc-gen-dto=${normalizeCmdPath(path.resolve(projectDir, "scripts/protoc-dto-plugin/protoc-dto-plugin"))}`,
    // Path all internal .proto imports will be resolved upon
    generationConfig.includeDir ? `--proto_path=${resolvePath(generationConfig.includeDir)}` : '',
    // Import settings: format, destination directory
    `--dto_out=withMappers:${resolvePath(generationConfig.destDir)}`,
    // Source .proto files
    ...generationConfig.path.map((p) => path.resolve(resolvePath(generationConfig.baseDir), p)),
  ];

  return fs.mkdirp(resolvePath(generationConfig.destDir))
    // Generate gRPC client
    .then(() => exec(grpcCmd.join(" "), {
      env: {
        ...process.env,
        PATH: `${process.env.PATH};${path.resolve(projectDir, "node_modules/.bin")}`,
      },
    }))
    // Run TS code generation for gRPC client
    .then(() => exec(tsCmd.join(" "), {
      env: {
        ...process.env,
        PATH: `${process.env.PATH};${path.resolve(projectDir, "node_modules/.bin")}`,
      },
    }))
    // Run DTO generation
    .then(() => exec(dtoCmd.join(" "), {
      env: {
        ...process.env,
        PATH: `${process.env.PATH};${path.resolve(projectDir, "node_modules/.bin")}`,
      },
    }))
    .then(() => {
      console.log("Code generation for 'main' process has finished successfully")
    });
}

/**
 * Downloads .proto files
 */
function download(repositoryConfig) {
  if (repositoryConfig == null) {
    return Promise.resolve();
  }

  // Currently only download from GitHub is supported
  if (repositoryConfig.type === "github") {
    return downloadFromGitHub(repositoryConfig);
  } else {
    return Promise.reject(new Error(`Repository '${repositoryConfig.type}' is not supported`));
  }
}

/**
 * Downloads .proto files grom GitHub repository
 */
function downloadFromGitHub(repositoryConfig) {
  const {auth, path: repositoryPath, ref, destDir, user, repository} = repositoryConfig;

  const gh = new GitHub(auth);

  console.log(`Download files from GitHub repository: ${user}/${repository}, ref=${ref}`);

  // Get .proto files from GitHub repo
  const repo = gh.getRepo(user, repository);
  const contentsPromise = Promise.all(
    repositoryPath.map((p) =>
      repo.getContents(ref, p, true)
        .then((content) => ({path: p, content: content.data}))));

  // Write retrieved .proto files into the disk
  return contentsPromise
    .then((files) => Promise.all(files.map((file) => writeFile(destDir, file.path, file.content))));
}

function writeFile(destDir, p, content) {
  const destPath = generatePath(destDir, p);
  console.log(`Writing file '${p}' into '${destPath}' directory`);
  return fs.outputFile(destPath, content);
}

function generatePath(destDir, p) {
  return path.resolve(resolvePath(destDir), p);
}

function resolvePath(path) {
  return path.replace(/\$([a-zA-Z0-9]+)/, (_, name) => {
    switch (name) {
      case "tempDir":
        return getTempDirName();
      case "projectDir":
        return projectDir;
      default: {
        throw new Error(`Path variable cannot be resolved: ${name}`)
      }
    }
  });
}

/**
 * On Windows platform protoc plugin does not work without .cmd suffix
 */
function normalizeCmdPath(path) {
  return process.platform === "win32" ? `${path}.cmd` : path;
}

function findSecretConfigFile() {
  console.log("Trying to find secret configuration file (proto-gen.secret)");
  const secretConfigPath = findConfig("proto-gen.secret", {"module": true, cwd: __dirname});
  if (secretConfigPath == null) {
    return {};
  } else {
    console.log(`Secret configuration file was not found: ${secretConfigPath}`);
    return require(secretConfigPath);
  }
}
