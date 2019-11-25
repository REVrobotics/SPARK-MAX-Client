import {noop} from "lodash";
import {credentials} from "grpc";
import {
  burnRequestFromDto,
  burnResponseToDto,
  connectRequestFromDto,
  connectResponseToDto,
  disconnectRequestFromDto,
  disconnectResponseToDto,
  factoryResetRequestFromDto,
  firmwareRequestFromDto,
  firmwareResponseToDto,
  getParameterRequestFromDto,
  IdAssignmentRequestDto,
  idAssignmentRequestFromDto,
  ListRequestDto,
  listRequestFromDto,
  listResponseToDto,
  parameterListRequestFromDto,
  parameterListResponse,
  parameterListResponseToDto,
  parameterResponse,
  parameterResponseToDto,
  pingRequestFromDto,
  pingResponseToDto,
  rootResponseToDto,
  setParameterRequestFromDto,
  setpointRequestFromDto,
  setpointResponseToDto,
  sparkMaxServerClient, telemetryListRequestFromDto, telemetryListResponseToDto
} from "../../proto-gen";
import {Message} from "google-protobuf";

// tslint:disable

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
  private grpcClient: sparkMaxServerClient;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.startGrpcClient();
  }

  private startGrpcClient() {
    this.grpcClient = new sparkMaxServerClient(`${this.host}:${this.port}`, credentials.createInsecure());
  }

  public connect(controlCommand: any, cb?: Function) {
    this.grpcClient.connect(connectRequestFromDto(controlCommand), wrapIntoGrpcCallback(cb, connectResponseToDto));
  }

  public disconnect(controlCommand: any, cb?: Function) {
    this.grpcClient.disconnect(disconnectRequestFromDto(controlCommand), wrapIntoGrpcCallback(cb, disconnectResponseToDto));
  }

  public list(listCommand: ListRequestDto, cb?: Function) {
    this.grpcClient.list(listRequestFromDto(listCommand), wrapIntoGrpcCallback(cb, listResponseToDto));
  }

  public getParameter(paramCommand: any, cb: Function) {
    this.grpcClient.getParameter(getParameterRequestFromDto(paramCommand), wrapIntoGrpcCallback(cb, (msg: parameterResponse) => {
      const result = parameterResponseToDto(msg);
      return { ...result, value: Number(result.value) };
    }));
  }

  public getParameterList(paramListCommand: any, cb: Function) {
    this.grpcClient.listParameters(parameterListRequestFromDto(paramListCommand), wrapIntoGrpcCallback(cb, (msg: parameterListResponse) => {
      const result = parameterListResponseToDto(msg);
      return result.parameters.map((param) => Number(param.value));
    }));
  }

  public setParameter(paramCommand: any, cb?: Function) {
    paramCommand.value += "";

    this.grpcClient.setParameter(setParameterRequestFromDto(paramCommand), wrapIntoGrpcCallback(cb, parameterResponseToDto));
  }

  public idAssignment(request: IdAssignmentRequestDto, cb?: Function) {
    return this.grpcClient.iDAssignment(idAssignmentRequestFromDto(request), wrapIntoGrpcCallback(cb, rootResponseToDto));
  }

  public setpoint(setpointCommand: any, cb?: Function) {
    this.grpcClient.setpoint(setpointRequestFromDto(setpointCommand), wrapIntoGrpcCallback(cb, setpointResponseToDto));
  }

  public burnFlash(burnCommand: any, cb?: Function) {
    this.grpcClient.burnFlash(burnRequestFromDto(burnCommand), wrapIntoGrpcCallback(cb, burnResponseToDto));
  }

  public heartbeat(heartbeatRequest: any, cb: Function) {
    cb(null, null);
  }

  public ping(pingCommand: any, cb: Function) {
    this.grpcClient.ping(pingRequestFromDto(pingCommand), wrapIntoGrpcCallback(cb, pingResponseToDto));
  }

  public firmware(firmwareCommand: any, cb: Function) {
    this.grpcClient.firmware(firmwareRequestFromDto(firmwareCommand), wrapIntoGrpcCallback(cb, firmwareResponseToDto));
  }

  public firmwareRecover(firmwareCommand: any, cb: Function) {
    this.grpcClient.firmwareRecover(firmwareRequestFromDto(firmwareCommand), wrapIntoGrpcCallback(cb, firmwareResponseToDto));
  }

  public firmwareLoadOrRecover(recover: boolean, firmwareCommand: any, cb: Function) {
    if (recover) {
      return this.firmwareRecover(firmwareCommand, cb);
    } else {
      return this.firmware(firmwareCommand, cb);
    }
  }

  public factoryReset(factoryResetCommand: any, cb: Function) {
    this.grpcClient.factoryReset(factoryResetRequestFromDto(factoryResetCommand), wrapIntoGrpcCallback(cb, rootResponseToDto));
  }

  public telemetryList(telemetryListCommand: any, cb: Function) {
    this.grpcClient.telemetryList(telemetryListRequestFromDto(telemetryListCommand), wrapIntoGrpcCallback(cb, telemetryListResponseToDto));
  }

  public telemetryStream() {
    return this.grpcClient.telemetryStream();
  }
}

export default SparkServer;
