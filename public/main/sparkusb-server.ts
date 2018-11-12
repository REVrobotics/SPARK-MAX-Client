import * as path from "path";
import {load, Root} from "protobufjs";
import {socket, Socket} from "zeromq";

// until better-queue gets a types definition
// tslint:disable
const queue = require("better-queue");

const PROTO_BUFFERS_TYPES = path.join(__dirname, "../protobuf/SPARK-MAX-Types.proto");
const PROTO_BUFFERS_COMMANDS = path.join(__dirname, "../protobuf/SPARK-MAX-Commands.proto");

class SparkServer {
  private readonly host: string;
  private readonly port: number;
  private socket: Socket;
  private cmdQueue: any;
  private root: Root;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.socket = socket("req");
    this.socket.connect(`tcp://${this.host}:${this.port}`);
    this.cmdQueue = new queue((input: any, cb: Function) => {
      if (input.id === "init") {
        load(PROTO_BUFFERS_TYPES).then((root: Root) => {
          load(PROTO_BUFFERS_COMMANDS).then((root: Root) => {
            this.root = root;
            cb(null, null);
          });
        });
      } else {
        const wire = this.root.lookupType("sparkusb.RequestWire");
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

  private sendCommand(lookupType: any, msg: string, cb?: Function) {
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
      const cmd = this.root.lookupType("sparkusb.ResponseWire");
      const msg: any = cmd.decode(result);
      if (typeof cb !== "undefined") {
        cb(error, msg[lookupType]);
      }
    });
  }

  public connect(controlCommand: any, cb?: Function) {
    controlCommand.ctrl = 1;
    this.sendCommand("control", controlCommand, cb);
  }

  public disconnect(controlCommand: any, cb?: Function) {
    controlCommand.ctrl = 2;
    this.sendCommand("control", controlCommand, cb);
  }

  public list(listCommand: any, cb?: Function) {
    listCommand.ctrl = 1;
    this.sendCommand("list", listCommand, cb);
  }

  public getParameter(paramCommand: any, cb: Function) {
    this.sendCommand("parameter", paramCommand, (error: any, result: any) => {
      result.value = Number(result.value);
      cb(error, result);
    });
  }

  public setParameter(paramCommand: any, cb?: Function) {
    paramCommand.value += "";
    this.sendCommand("parameter", paramCommand, cb);
  }

  public setpoint(setpointCommand: any, cb?: Function) {
    setpointCommand.enable = true;
    this.sendCommand("setpoint", setpointCommand, cb);
  }

  public burnFlash(rootCommand: any, cb: Function) {
    cb(null, null);
  }

  public heartbeat(heartbeatRequest: any, cb: Function) {
    cb(null, null);
  }
}

export default SparkServer;