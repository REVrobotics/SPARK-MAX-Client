import * as path from "path";
import {noop} from "lodash";
import {load, Root} from "protobufjs";
import {socket, Socket} from "zeromq";
import {credentials} from "grpc";
import {
  burnRequestFromDto, burnResponseToDto,
  connectRequestFromDto,
  connectResponseToDto,
  disconnectRequestFromDto,
  disconnectResponseToDto,
  factoryResetRequestFromDto,
  firmwareRequestFromDto,
  firmwareResponseToDto,
  getParameterRequestFromDto, ListRequestDto,
  listRequestFromDto,
  listResponseToDto, parameterListRequestFromDto, parameterListResponse, parameterListResponseToDto, parameterResponse,
  parameterResponseToDto,
  pingRequestFromDto, pingResponseToDto,
  rootResponseToDto,
  setParameterRequestFromDto,
  setpointRequestFromDto,
  setpointResponseToDto,
  sparkMaxServerClient
} from "../proto-gen";
import {Message} from "google-protobuf";

// until better-queue gets a types definition
// tslint:disable
const queue = require("better-queue");

// all URLs should be relative ./build directory
const PROTO_BUFFERS_TYPES = path.join(__dirname, "./protobuf/SPARK-MAX-Types.proto");
const PROTO_BUFFERS_COMMANDS = path.join(__dirname, "./protobuf/SPARK-MAX-Commands.proto");

function wrapIntoGrpcCallback<TMessage extends Message, TDto>(cb: Function = noop,
                                                                 map: (msg: TMessage) => TDto): (err: any, response: any) => void {
  return (err, msg) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, map(msg));
  };
}

class SparkServer {
  private readonly host: string;
  private readonly port: number;
  private socket: Socket;
  private cmdQueue: any;
  private grpcClient: sparkMaxServerClient;
  private root: Root;
  private isGrpc: boolean;

  constructor(host: string, port: number, isGrpc: boolean) {
    this.host = host;
    this.port = port;
    this.isGrpc = isGrpc;
    this.socket = socket("req");
    this.socket.connect(`tcp://${this.host}:${this.port}`);
    if (this.isGrpc) {
      this.startGrpcClient();
    } else {
      this.startZmqClient();
    }
  }

  private startGrpcClient() {
    this.grpcClient = new sparkMaxServerClient(`${this.host}:${this.port}`, credentials.createInsecure());
  }

  private startZmqClient() {
    this.cmdQueue = new queue((input: any, cb: Function) => {
      if (input.id === "init") {
        load(PROTO_BUFFERS_TYPES).then(() => {
          load(PROTO_BUFFERS_COMMANDS).then((root: Root) => {
            this.root = root;
            cb(null, null);
          });
        });
      } else {
        const wire = this.root.lookupType("sparkmax.RequestWire");
        let wireMsg: any = wire.create({req: input.id});
        wireMsg[input.id] = input.msg;
        const wireBuff = wire.encode(wireMsg).finish();
        this.socket.send(wireBuff as Buffer);
        this.socket.on("message", (msg: Buffer) => {
          cb(null, msg);
        });
      }
    }, {
      priority: (input: any, cb: Function) => {
        if (input.id === "init") return cb(null, 100);
        if (input.id === "control") return cb(null, 10);
        if (input.id === "setpoint") return cb(null, 5);
        if (input.id === "heartbeat") return cb(null, 5);
        cb(null, 1);
      }
    });

    this.cmdQueue.push({id: "init"});
  }

  private sendCommand(lookupType: any, responseType: any, msg: any, cb?: Function) {
    /*Queue the attached request
    * Priority:
    *   - Connect (also flush queue)
    *   - Disconnect (also flush queue)
    *     - Setpoint (named so only 1 is ever in the queue)
    *     - Heartbeat (named so only 1 is ever in the queue)
    *       - Get Param
    *       - Set Param
    *       - Burn Param
    *       - List
    *       - Burn Flash
    *       - All others
    *
    * All commands will be part of the requestWire
    * and need to be encoded as such
    */
    const req: any = {id: lookupType};

    if (lookupType === "setpoint" || lookupType === "heartbeat") {
      req.count = 1;
    }

    req.msg = msg;

    this.cmdQueue.push(req, (error: any, result: any) => {
      const cmd = this.root.lookupType("sparkmax.ResponseWire");
      const msg: any = cmd.decode(result);
      if (typeof cb !== "undefined") {
        cb(error, msg[responseType]);
      }
    });
  }

  public connect(controlCommand: any, cb?: Function) {
    if (this.isGrpc) {
      this.grpcClient.connect(connectRequestFromDto(controlCommand), wrapIntoGrpcCallback(cb, connectResponseToDto));
    } else {
      controlCommand.ctrl = 1;
      this.sendCommand("connect", "connect", controlCommand, cb);
    }
  }

  public disconnect(controlCommand: any, cb?: Function) {
    if (this.isGrpc) {
      this.grpcClient.disconnect(disconnectRequestFromDto(controlCommand), wrapIntoGrpcCallback(cb, disconnectResponseToDto));
    } else {
      controlCommand.ctrl = 2;
      this.sendCommand("disconnect", "disconnect", controlCommand, cb);
    }
  }

  public list(listCommand: ListRequestDto, cb?: Function) {
    if (this.isGrpc) {
      this.grpcClient.list(listRequestFromDto(listCommand), wrapIntoGrpcCallback(cb, listResponseToDto));
    } else {
      this.sendCommand("list", "list", listCommand, cb);
    }
  }

  public getParameter(paramCommand: any, cb: Function) {
    if (this.isGrpc) {
      this.grpcClient.getParameter(getParameterRequestFromDto(paramCommand), wrapIntoGrpcCallback(cb, (msg: parameterResponse) => {
        const result = parameterResponseToDto(msg);
        return { ...result, value: Number(result.value) };
      }));
    } else {
      this.sendCommand("getParameter", "parameter", paramCommand, (error: any, result: any) => {
        result.value = Number(result.value);
        cb(error, result);
      });
    }
  }

  public getParameterList(paramListCommand: any, cb: Function) {
    if (this.isGrpc) {
      this.grpcClient.listParameters(parameterListRequestFromDto(paramListCommand), wrapIntoGrpcCallback(cb, (msg: parameterListResponse) => {
        const result = parameterListResponseToDto(msg);
        return result.parameters.map((param) => Number(param.value));
      }));
    } else {
      this.sendCommand("listParameters", "listParameters", paramListCommand, (error: any, result: any) => {
        cb(error, result);
      });
    }
  }

  public setParameter(paramCommand: any, cb?: Function) {
    paramCommand.value += "";

    if (this.isGrpc) {
      this.grpcClient.setParameter(setParameterRequestFromDto(paramCommand), wrapIntoGrpcCallback(cb, parameterResponseToDto));
    } else {
      this.sendCommand("setParameter", "parameter", paramCommand, cb);
    }
  }

  public setpoint(setpointCommand: any, cb?: Function) {
    setpointCommand.setpoint = setpointCommand.setpoint / 1024;
    if (this.isGrpc) {
      this.grpcClient.setpoint(setpointRequestFromDto(setpointCommand), wrapIntoGrpcCallback(cb, setpointResponseToDto));
    } else {
      this.sendCommand("setpoint", "setpoint", setpointCommand, cb);
    }
  }

  public burnFlash(burnCommand: any, cb?: Function) {
    if (this.isGrpc) {
      this.grpcClient.burnFlash(burnRequestFromDto(burnCommand), wrapIntoGrpcCallback(cb, burnResponseToDto));
    } else {
      burnCommand.verify = true;
      this.sendCommand("burn", "burn", burnCommand, cb);
    }
  }

  public heartbeat(heartbeatRequest: any, cb: Function) {
    cb(null, null);
  }

  public ping(pingCommand: any, cb: Function) {
    if (this.isGrpc) {
      this.grpcClient.ping(pingRequestFromDto(pingCommand), wrapIntoGrpcCallback(cb, pingResponseToDto));
    } else {
      this.sendCommand("ping", "ping", pingCommand, cb);
    }
  }

  public firmware(firmwareCommand: any, cb: Function) {
    if (this.isGrpc) {
      this.grpcClient.firmware(firmwareRequestFromDto(firmwareCommand), wrapIntoGrpcCallback(cb, firmwareResponseToDto));
    } else {
      this.sendCommand("firmware", "firmware", firmwareCommand, cb);
    }
  }

  public factoryReset(factoryResetCommand: any, cb: Function) {
    if (this.isGrpc) {
      this.grpcClient.factoryReset(factoryResetRequestFromDto(factoryResetCommand), wrapIntoGrpcCallback(cb, rootResponseToDto));
    } else {
      this.sendCommand("factoryReset", "factoryReset", factoryResetCommand, cb);
    }
  }
}

export default SparkServer;