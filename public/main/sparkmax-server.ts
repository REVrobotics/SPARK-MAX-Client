import * as path from "path";
import {noop} from "lodash";
import {load, Root} from "protobufjs";
import {socket, Socket} from "zeromq";
import {credentials} from "grpc";
import {
  burnRequest,
  connectRequest,
  disconnectRequest, factoryResetRequest, firmwareRequest, firmwareResponse,
  getParameterRequest,
  listRequest,
  listResponse, parameterResponse, pingRequest, rootCommand, setParameterRequest, setpointRequest, setpointResponse,
  sparkMaxServerClient
} from "../proto-gen";
import {Message} from "google-protobuf";

// until better-queue gets a types definition
// tslint:disable
const queue = require("better-queue");

const PROTO_BUFFERS_TYPES = path.join(__dirname, "../protobuf/SPARK-MAX-Types.proto");
const PROTO_BUFFERS_COMMANDS = path.join(__dirname, "../protobuf/SPARK-MAX-Commands.proto");

function messageToObject(message: Message): any {
  return message.toObject() as any;
}

function createRootCommand(rootObject?: rootCommand.AsObject): rootCommand | undefined {
  if (rootObject == null) {
    return;
  }

  const root = new rootCommand();
  root.setDevice(rootObject.device);
  return root;
}

function wrapIntoGrpcCallback<TMessage extends Message, TDto>(cb: Function = noop,
                                                                 map: (msg: TMessage) => TDto = messageToObject): (err: any, response: any) => void {
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

  private sendCommand(lookupType: any, responseType: any, msg: string, cb?: Function) {
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
      const request = new connectRequest();
      request.setDevice(controlCommand.device);
      this.grpcClient.connect(request, wrapIntoGrpcCallback(cb));
    } else {
      controlCommand.ctrl = 1;
      this.sendCommand("connect", "connect", controlCommand, cb);
    }
  }

  public disconnect(controlCommand: any, cb?: Function) {
    if (this.isGrpc) {
      const request = new disconnectRequest();
      request.setDevice(controlCommand.device);
      this.grpcClient.disconnect(request, wrapIntoGrpcCallback(cb));
    } else {
      controlCommand.ctrl = 2;
      this.sendCommand("disconnect", "disconnect", controlCommand, cb);
    }
  }

  public list(listCommand: any, cb?: Function) {
    if (this.isGrpc) {
      const request = new listRequest();
      request.setAll(listCommand.all);
      request.setRoot(createRootCommand(listCommand.root));
      this.grpcClient.list(request, wrapIntoGrpcCallback(cb, (msg: listResponse) => ({
        deviceList: msg.getDevicelistList(),
        driverList: msg.getDriverlistList(),
        extendedList: msg.getExtendedlistList().map((item) => ({
          deviceId: item.getDeviceid(),
          deviceName: item.getDevicename(),
          driverName: item.getDrivername(),
          interfaceName: item.getInterfacename(),
          uniqueId: item.getUniqueid(),
          updateable: item.getUpdateable(),
        })),
      })));
    } else {
      listCommand.ctrl = 1;
      this.sendCommand("list", "list", listCommand, cb);
    }
  }

  public getParameter(paramCommand: any, cb: Function) {
    if (this.isGrpc) {
      const request = new getParameterRequest();
      request.setRoot(createRootCommand(paramCommand.root));
      request.setParameter(paramCommand.parameter);
      this.grpcClient.getParameter(request, wrapIntoGrpcCallback(cb, (msg: parameterResponse) => ({
        ...msg.toObject(),
        value: Number(msg.getValue()),
      })));
    } else {
      this.sendCommand("getParameter", "parameter", paramCommand, (error: any, result: any) => {
        result.value = Number(result.value);
        cb(error, result);
      });
    }
  }

  public setParameter(paramCommand: any, cb?: Function) {
    paramCommand.value += "";

    if (this.isGrpc) {
      const request = new setParameterRequest();
      request.setRoot(createRootCommand(paramCommand.root));
      request.setParameter(paramCommand.parameter);
      request.setValue(paramCommand.value);
      if (paramCommand.root) {
        const root = new rootCommand();
        root.setDevice(paramCommand.root.device);
        request.setRoot(root);
      }
      this.grpcClient.setParameter(request, wrapIntoGrpcCallback(cb));
    } else {
      this.sendCommand("setParameter", "parameter", paramCommand, cb);
    }
  }

  public setpoint(setpointCommand: any, cb?: Function) {
    setpointCommand.setpoint = setpointCommand.setpoint / 1024;
    if (this.isGrpc) {
      const request = new setpointRequest();
      request.setRoot(createRootCommand(setpointCommand.root));
      request.setAuxsetpoint(setpointCommand.auxSetpoint);
      request.setEnable(setpointCommand.enable);
      request.setPidslot(setpointCommand.pidSlot);
      request.setSetpoint(setpointCommand.setpoint);
      this.grpcClient.setpoint(request, wrapIntoGrpcCallback(cb, (msg: setpointResponse) => ({
        isRunning: msg.getIsrunning(),
        setpoint: msg.getSetpoint(),
      })));
    } else {
      this.sendCommand("setpoint", "setpoint", setpointCommand, cb);
    }
  }

  public burnFlash(burnCommand: any, cb?: Function) {
    if (this.isGrpc) {
      const request = new burnRequest();
      request.setRoot(createRootCommand(burnCommand.root));
      this.grpcClient.burnFlash(request, wrapIntoGrpcCallback(cb));
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
      const request = new pingRequest();
      request.setDevice(pingCommand.device);
      this.grpcClient.ping(request, wrapIntoGrpcCallback(cb));
    } else {
      this.sendCommand("ping", "ping", pingCommand, cb);
    }
  }

  public firmware(firmwareCommand: any, cb: Function) {
    if (this.isGrpc) {
      const request = new firmwareRequest();
      request.setRoot(createRootCommand(firmwareCommand.root));
      request.setDevicestoupdateList(firmwareCommand.devicesToUpdate);
      request.setFilename(firmwareCommand.filename);
      this.grpcClient.firmware(request, wrapIntoGrpcCallback(cb, (msg: firmwareResponse) => ({
        build: msg.getBuild(),
        hardwareVersion: msg.getHardwareversion(),
        isDebug: msg.getIsdebug(),
        isUpdating: msg.getIsupdating(),
        major: msg.getMajor(),
        minor: msg.getMinor(),
        updateComplete: msg.getUpdatecomplete(),
        updateCompletedSuccessfully: msg.getUpdatecompletedsuccessfully(),
        updateStageMessage: msg.getUpdatestagemessage(),
        updateStagePercent: msg.getUpdatestagepercent(),
        updateStarted: msg.getUpdatestarted(),
        version: msg.getVersion(),
      })));
    } else {
      this.sendCommand("firmware", "firmware", firmwareCommand, cb);
    }
  }

  public factoryReset(factoryResetCommand: any, cb: Function) {
    if (this.isGrpc) {
      const request = new factoryResetRequest();
      request.setRoot(createRootCommand(factoryResetCommand.root));
      request.setFullwipe(factoryResetCommand.fullWipe);
      request.setBurnafterwrite(factoryResetCommand.burnAfterWrite);
      this.grpcClient.factoryReset(factoryResetCommand, wrapIntoGrpcCallback(cb));
    } else {
      this.sendCommand("factoryReset", "factoryReset", factoryResetCommand, cb);
    }
  }
}

export default SparkServer;