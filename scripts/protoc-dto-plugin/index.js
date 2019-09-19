const {CodeGeneratorRequest, CodeGeneratorResponse, CodeGeneratorResponseError} = require("protoc-plugin");

const { protoToFileName } = require ("./util");
const DtoGenerator = require('./dto-generator');

const generator = new DtoGenerator();

CodeGeneratorRequest()
  .then((r) => {
    // convert to object
    // alternately, you can do all the google-protobuf stuff here
    const req = r.toObject();
    // just get proto files that are being parsed directly by protoc
    const protos = req.protoFileList.filter(p => req.fileToGenerateList.indexOf(p.name) !== -1);
    // return array of file objects: [{name, contents, insertion_point}]
    return protos.map((proto) => ({
      name: protoToFileName(proto.name, "dto", true),
      content: generator.generate(proto, {
        dto: true,
        mappers: req.parameter === 'withMappers',
      }),
    }));
  })
  .then(CodeGeneratorResponse())
  .catch(CodeGeneratorResponseError());
