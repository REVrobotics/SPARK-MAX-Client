
module.exports = {
  // "download" configuration describes where .proto files should be download from
  download: {
    // "type" determines download engine ("github" is only supported engine for now).
    type: "github",
    // Owner of the GitHub repository
    user: "willtoth",

    // Authentication is necessary for private repository.
    // It is recommended to put all sensitive settings into the proto-gen.secret.{js|json} file
    // Look at proto-gen.secret-sample.js for details
    // auth: {
    //   ...
    // },

    // Name of the target repository
    repository: "SPARK-MAX-Server-Cpp",
    // Name of the target branch
    ref: "telemetry",
    // List of files to be download
    path: ["src/main/protobuf/SPARK-MAX-Types.proto", "src/main/protobuf/SPARK-MAX-Commands.proto"],
    // Name of the destination directory where .proto files will be downloaded to.
    // The following path variables are supported:
    // - $tempDir is a name of the temporary directory. This is an OS-specific temporary directory
    // - $projectDir is a project root.
    destDir: "$tempDir"
  },
  // "generation" defines options used by protoc tool
  generation: [{
    // Generated files should be used either by "main" or "renderer" process
    // gRPC code is generated only for "main" process
    use: "renderer",
    // All "import" statements will be resolved upon this directory.
    includeDir: "$tempDir/src/main/protobuf",
    // Base directory for "path" property
    baseDir: "$tempDir/src/main/protobuf",
    // Path to all .proto files relative to "baseDir"
    path: ["SPARK-MAX-Types.proto", "SPARK-MAX-Commands.proto"],
    // Destination path where all generated files should be placed to
    destDir: "$projectDir/src/models/proto-gen"
  }, {
    // Generated files should be used either by "main" or "renderer" process
    // gRPC code is generated only for "main" process
    use: "main",
    // All "import" statements will be resolved upon this directory.
    includeDir: "$tempDir/src/main/protobuf",
    // Base directory where all .proto files located.
    baseDir: "$tempDir/src/main/protobuf",
    // Path to all .proto files relative to "baseDir"
    path: ["SPARK-MAX-Types.proto", "SPARK-MAX-Commands.proto"],
    // Destination path where all generated files should be placed to
    destDir: "$projectDir/public/proto-gen"
  }]
};
