// package: sparkmax
// file: SPARK-MAX-Commands.proto

/* tslint:disable */

import * as grpc from "grpc";
import * as SPARK_MAX_Commands_pb from "./SPARK-MAX-Commands_pb";
import * as SPARK_MAX_Types_pb from "./SPARK-MAX-Types_pb";

interface IsparkMaxServerService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    connect: IsparkMaxServerService_IConnect;
    disconnect: IsparkMaxServerService_IDisconnect;
    ping: IsparkMaxServerService_IPing;
    list: IsparkMaxServerService_IList;
    firmware: IsparkMaxServerService_IFirmware;
    firmwareRecover: IsparkMaxServerService_IFirmwareRecover;
    setParameter: IsparkMaxServerService_ISetParameter;
    getParameter: IsparkMaxServerService_IGetParameter;
    burnFlash: IsparkMaxServerService_IBurnFlash;
    listParameters: IsparkMaxServerService_IListParameters;
    setpoint: IsparkMaxServerService_ISetpoint;
    follow: IsparkMaxServerService_IFollow;
    clearFaults: IsparkMaxServerService_IClearFaults;
    dRVStatus: IsparkMaxServerService_IDRVStatus;
    telemetry: IsparkMaxServerService_ITelemetry;
    factoryReset: IsparkMaxServerService_IFactoryReset;
    iDAssignment: IsparkMaxServerService_IIDAssignment;
    identify: IsparkMaxServerService_IIdentify;
}

interface IsparkMaxServerService_IConnect extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.connectRequest, SPARK_MAX_Commands_pb.connectResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Connect"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.connectRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.connectRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.connectResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.connectResponse>;
}
interface IsparkMaxServerService_IDisconnect extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.disconnectRequest, SPARK_MAX_Commands_pb.disconnectResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Disconnect"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.disconnectRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.disconnectRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.disconnectResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.disconnectResponse>;
}
interface IsparkMaxServerService_IPing extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.pingRequest, SPARK_MAX_Commands_pb.pingResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Ping"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.pingRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.pingRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.pingResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.pingResponse>;
}
interface IsparkMaxServerService_IList extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.listRequest, SPARK_MAX_Commands_pb.listResponse> {
    path: string; // "/sparkmax.sparkMaxServer/List"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.listRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.listRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.listResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.listResponse>;
}
interface IsparkMaxServerService_IFirmware extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.firmwareRequest, SPARK_MAX_Commands_pb.firmwareResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Firmware"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.firmwareRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.firmwareRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.firmwareResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.firmwareResponse>;
}
interface IsparkMaxServerService_IFirmwareRecover extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.firmwareRequest, SPARK_MAX_Commands_pb.firmwareResponse> {
    path: string; // "/sparkmax.sparkMaxServer/FirmwareRecover"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.firmwareRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.firmwareRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.firmwareResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.firmwareResponse>;
}
interface IsparkMaxServerService_ISetParameter extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.setParameterRequest, SPARK_MAX_Commands_pb.parameterResponse> {
    path: string; // "/sparkmax.sparkMaxServer/SetParameter"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.setParameterRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.setParameterRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.parameterResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.parameterResponse>;
}
interface IsparkMaxServerService_IGetParameter extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.getParameterRequest, SPARK_MAX_Commands_pb.parameterResponse> {
    path: string; // "/sparkmax.sparkMaxServer/GetParameter"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.getParameterRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.getParameterRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.parameterResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.parameterResponse>;
}
interface IsparkMaxServerService_IBurnFlash extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.burnRequest, SPARK_MAX_Commands_pb.burnResponse> {
    path: string; // "/sparkmax.sparkMaxServer/BurnFlash"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.burnRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.burnRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.burnResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.burnResponse>;
}
interface IsparkMaxServerService_IListParameters extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.parameterListRequest, SPARK_MAX_Commands_pb.parameterListResponse> {
    path: string; // "/sparkmax.sparkMaxServer/ListParameters"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.parameterListRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.parameterListRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.parameterListResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.parameterListResponse>;
}
interface IsparkMaxServerService_ISetpoint extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.setpointRequest, SPARK_MAX_Commands_pb.setpointResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Setpoint"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.setpointRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.setpointRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.setpointResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.setpointResponse>;
}
interface IsparkMaxServerService_IFollow extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.followerRequest, SPARK_MAX_Commands_pb.rootResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Follow"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.followerRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.followerRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.rootResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.rootResponse>;
}
interface IsparkMaxServerService_IClearFaults extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.clearFaultsRequest, SPARK_MAX_Commands_pb.clearFaultsResponse> {
    path: string; // "/sparkmax.sparkMaxServer/ClearFaults"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.clearFaultsRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.clearFaultsRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.clearFaultsResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.clearFaultsResponse>;
}
interface IsparkMaxServerService_IDRVStatus extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.DRVStatusRequest, SPARK_MAX_Commands_pb.DRVStatusResponse> {
    path: string; // "/sparkmax.sparkMaxServer/DRVStatus"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.DRVStatusRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.DRVStatusRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.DRVStatusResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.DRVStatusResponse>;
}
interface IsparkMaxServerService_ITelemetry extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.telemetryRequest, SPARK_MAX_Commands_pb.telemetryResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Telemetry"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.telemetryRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.telemetryRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.telemetryResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.telemetryResponse>;
}
interface IsparkMaxServerService_IFactoryReset extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.factoryResetRequest, SPARK_MAX_Commands_pb.rootResponse> {
    path: string; // "/sparkmax.sparkMaxServer/FactoryReset"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.factoryResetRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.factoryResetRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.rootResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.rootResponse>;
}
interface IsparkMaxServerService_IIDAssignment extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.idAssignmentRequest, SPARK_MAX_Commands_pb.rootResponse> {
    path: string; // "/sparkmax.sparkMaxServer/IDAssignment"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.idAssignmentRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.idAssignmentRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.rootResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.rootResponse>;
}
interface IsparkMaxServerService_IIdentify extends grpc.MethodDefinition<SPARK_MAX_Commands_pb.identifyRequest, SPARK_MAX_Commands_pb.rootResponse> {
    path: string; // "/sparkmax.sparkMaxServer/Identify"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<SPARK_MAX_Commands_pb.identifyRequest>;
    requestDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.identifyRequest>;
    responseSerialize: grpc.serialize<SPARK_MAX_Commands_pb.rootResponse>;
    responseDeserialize: grpc.deserialize<SPARK_MAX_Commands_pb.rootResponse>;
}

export const sparkMaxServerService: IsparkMaxServerService;

export interface IsparkMaxServerServer {
    connect: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.connectRequest, SPARK_MAX_Commands_pb.connectResponse>;
    disconnect: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.disconnectRequest, SPARK_MAX_Commands_pb.disconnectResponse>;
    ping: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.pingRequest, SPARK_MAX_Commands_pb.pingResponse>;
    list: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.listRequest, SPARK_MAX_Commands_pb.listResponse>;
    firmware: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.firmwareRequest, SPARK_MAX_Commands_pb.firmwareResponse>;
    firmwareRecover: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.firmwareRequest, SPARK_MAX_Commands_pb.firmwareResponse>;
    setParameter: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.setParameterRequest, SPARK_MAX_Commands_pb.parameterResponse>;
    getParameter: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.getParameterRequest, SPARK_MAX_Commands_pb.parameterResponse>;
    burnFlash: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.burnRequest, SPARK_MAX_Commands_pb.burnResponse>;
    listParameters: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.parameterListRequest, SPARK_MAX_Commands_pb.parameterListResponse>;
    setpoint: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.setpointRequest, SPARK_MAX_Commands_pb.setpointResponse>;
    follow: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.followerRequest, SPARK_MAX_Commands_pb.rootResponse>;
    clearFaults: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.clearFaultsRequest, SPARK_MAX_Commands_pb.clearFaultsResponse>;
    dRVStatus: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.DRVStatusRequest, SPARK_MAX_Commands_pb.DRVStatusResponse>;
    telemetry: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.telemetryRequest, SPARK_MAX_Commands_pb.telemetryResponse>;
    factoryReset: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.factoryResetRequest, SPARK_MAX_Commands_pb.rootResponse>;
    iDAssignment: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.idAssignmentRequest, SPARK_MAX_Commands_pb.rootResponse>;
    identify: grpc.handleUnaryCall<SPARK_MAX_Commands_pb.identifyRequest, SPARK_MAX_Commands_pb.rootResponse>;
}

export interface IsparkMaxServerClient {
    connect(request: SPARK_MAX_Commands_pb.connectRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.connectResponse) => void): grpc.ClientUnaryCall;
    connect(request: SPARK_MAX_Commands_pb.connectRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.connectResponse) => void): grpc.ClientUnaryCall;
    connect(request: SPARK_MAX_Commands_pb.connectRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.connectResponse) => void): grpc.ClientUnaryCall;
    disconnect(request: SPARK_MAX_Commands_pb.disconnectRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.disconnectResponse) => void): grpc.ClientUnaryCall;
    disconnect(request: SPARK_MAX_Commands_pb.disconnectRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.disconnectResponse) => void): grpc.ClientUnaryCall;
    disconnect(request: SPARK_MAX_Commands_pb.disconnectRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.disconnectResponse) => void): grpc.ClientUnaryCall;
    ping(request: SPARK_MAX_Commands_pb.pingRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.pingResponse) => void): grpc.ClientUnaryCall;
    ping(request: SPARK_MAX_Commands_pb.pingRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.pingResponse) => void): grpc.ClientUnaryCall;
    ping(request: SPARK_MAX_Commands_pb.pingRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.pingResponse) => void): grpc.ClientUnaryCall;
    list(request: SPARK_MAX_Commands_pb.listRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.listResponse) => void): grpc.ClientUnaryCall;
    list(request: SPARK_MAX_Commands_pb.listRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.listResponse) => void): grpc.ClientUnaryCall;
    list(request: SPARK_MAX_Commands_pb.listRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.listResponse) => void): grpc.ClientUnaryCall;
    firmware(request: SPARK_MAX_Commands_pb.firmwareRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    firmware(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    firmware(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    firmwareRecover(request: SPARK_MAX_Commands_pb.firmwareRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    firmwareRecover(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    firmwareRecover(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    setParameter(request: SPARK_MAX_Commands_pb.setParameterRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    setParameter(request: SPARK_MAX_Commands_pb.setParameterRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    setParameter(request: SPARK_MAX_Commands_pb.setParameterRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    getParameter(request: SPARK_MAX_Commands_pb.getParameterRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    getParameter(request: SPARK_MAX_Commands_pb.getParameterRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    getParameter(request: SPARK_MAX_Commands_pb.getParameterRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    burnFlash(request: SPARK_MAX_Commands_pb.burnRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.burnResponse) => void): grpc.ClientUnaryCall;
    burnFlash(request: SPARK_MAX_Commands_pb.burnRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.burnResponse) => void): grpc.ClientUnaryCall;
    burnFlash(request: SPARK_MAX_Commands_pb.burnRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.burnResponse) => void): grpc.ClientUnaryCall;
    listParameters(request: SPARK_MAX_Commands_pb.parameterListRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterListResponse) => void): grpc.ClientUnaryCall;
    listParameters(request: SPARK_MAX_Commands_pb.parameterListRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterListResponse) => void): grpc.ClientUnaryCall;
    listParameters(request: SPARK_MAX_Commands_pb.parameterListRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterListResponse) => void): grpc.ClientUnaryCall;
    setpoint(request: SPARK_MAX_Commands_pb.setpointRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.setpointResponse) => void): grpc.ClientUnaryCall;
    setpoint(request: SPARK_MAX_Commands_pb.setpointRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.setpointResponse) => void): grpc.ClientUnaryCall;
    setpoint(request: SPARK_MAX_Commands_pb.setpointRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.setpointResponse) => void): grpc.ClientUnaryCall;
    follow(request: SPARK_MAX_Commands_pb.followerRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    follow(request: SPARK_MAX_Commands_pb.followerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    follow(request: SPARK_MAX_Commands_pb.followerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    clearFaults(request: SPARK_MAX_Commands_pb.clearFaultsRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.clearFaultsResponse) => void): grpc.ClientUnaryCall;
    clearFaults(request: SPARK_MAX_Commands_pb.clearFaultsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.clearFaultsResponse) => void): grpc.ClientUnaryCall;
    clearFaults(request: SPARK_MAX_Commands_pb.clearFaultsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.clearFaultsResponse) => void): grpc.ClientUnaryCall;
    dRVStatus(request: SPARK_MAX_Commands_pb.DRVStatusRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.DRVStatusResponse) => void): grpc.ClientUnaryCall;
    dRVStatus(request: SPARK_MAX_Commands_pb.DRVStatusRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.DRVStatusResponse) => void): grpc.ClientUnaryCall;
    dRVStatus(request: SPARK_MAX_Commands_pb.DRVStatusRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.DRVStatusResponse) => void): grpc.ClientUnaryCall;
    telemetry(request: SPARK_MAX_Commands_pb.telemetryRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.telemetryResponse) => void): grpc.ClientUnaryCall;
    telemetry(request: SPARK_MAX_Commands_pb.telemetryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.telemetryResponse) => void): grpc.ClientUnaryCall;
    telemetry(request: SPARK_MAX_Commands_pb.telemetryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.telemetryResponse) => void): grpc.ClientUnaryCall;
    factoryReset(request: SPARK_MAX_Commands_pb.factoryResetRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    factoryReset(request: SPARK_MAX_Commands_pb.factoryResetRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    factoryReset(request: SPARK_MAX_Commands_pb.factoryResetRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    iDAssignment(request: SPARK_MAX_Commands_pb.idAssignmentRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    iDAssignment(request: SPARK_MAX_Commands_pb.idAssignmentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    iDAssignment(request: SPARK_MAX_Commands_pb.idAssignmentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    identify(request: SPARK_MAX_Commands_pb.identifyRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    identify(request: SPARK_MAX_Commands_pb.identifyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    identify(request: SPARK_MAX_Commands_pb.identifyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
}

export class sparkMaxServerClient extends grpc.Client implements IsparkMaxServerClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public connect(request: SPARK_MAX_Commands_pb.connectRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.connectResponse) => void): grpc.ClientUnaryCall;
    public connect(request: SPARK_MAX_Commands_pb.connectRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.connectResponse) => void): grpc.ClientUnaryCall;
    public connect(request: SPARK_MAX_Commands_pb.connectRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.connectResponse) => void): grpc.ClientUnaryCall;
    public disconnect(request: SPARK_MAX_Commands_pb.disconnectRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.disconnectResponse) => void): grpc.ClientUnaryCall;
    public disconnect(request: SPARK_MAX_Commands_pb.disconnectRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.disconnectResponse) => void): grpc.ClientUnaryCall;
    public disconnect(request: SPARK_MAX_Commands_pb.disconnectRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.disconnectResponse) => void): grpc.ClientUnaryCall;
    public ping(request: SPARK_MAX_Commands_pb.pingRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.pingResponse) => void): grpc.ClientUnaryCall;
    public ping(request: SPARK_MAX_Commands_pb.pingRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.pingResponse) => void): grpc.ClientUnaryCall;
    public ping(request: SPARK_MAX_Commands_pb.pingRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.pingResponse) => void): grpc.ClientUnaryCall;
    public list(request: SPARK_MAX_Commands_pb.listRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.listResponse) => void): grpc.ClientUnaryCall;
    public list(request: SPARK_MAX_Commands_pb.listRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.listResponse) => void): grpc.ClientUnaryCall;
    public list(request: SPARK_MAX_Commands_pb.listRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.listResponse) => void): grpc.ClientUnaryCall;
    public firmware(request: SPARK_MAX_Commands_pb.firmwareRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    public firmware(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    public firmware(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    public firmwareRecover(request: SPARK_MAX_Commands_pb.firmwareRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    public firmwareRecover(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    public firmwareRecover(request: SPARK_MAX_Commands_pb.firmwareRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.firmwareResponse) => void): grpc.ClientUnaryCall;
    public setParameter(request: SPARK_MAX_Commands_pb.setParameterRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    public setParameter(request: SPARK_MAX_Commands_pb.setParameterRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    public setParameter(request: SPARK_MAX_Commands_pb.setParameterRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    public getParameter(request: SPARK_MAX_Commands_pb.getParameterRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    public getParameter(request: SPARK_MAX_Commands_pb.getParameterRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    public getParameter(request: SPARK_MAX_Commands_pb.getParameterRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterResponse) => void): grpc.ClientUnaryCall;
    public burnFlash(request: SPARK_MAX_Commands_pb.burnRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.burnResponse) => void): grpc.ClientUnaryCall;
    public burnFlash(request: SPARK_MAX_Commands_pb.burnRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.burnResponse) => void): grpc.ClientUnaryCall;
    public burnFlash(request: SPARK_MAX_Commands_pb.burnRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.burnResponse) => void): grpc.ClientUnaryCall;
    public listParameters(request: SPARK_MAX_Commands_pb.parameterListRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterListResponse) => void): grpc.ClientUnaryCall;
    public listParameters(request: SPARK_MAX_Commands_pb.parameterListRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterListResponse) => void): grpc.ClientUnaryCall;
    public listParameters(request: SPARK_MAX_Commands_pb.parameterListRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.parameterListResponse) => void): grpc.ClientUnaryCall;
    public setpoint(request: SPARK_MAX_Commands_pb.setpointRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.setpointResponse) => void): grpc.ClientUnaryCall;
    public setpoint(request: SPARK_MAX_Commands_pb.setpointRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.setpointResponse) => void): grpc.ClientUnaryCall;
    public setpoint(request: SPARK_MAX_Commands_pb.setpointRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.setpointResponse) => void): grpc.ClientUnaryCall;
    public follow(request: SPARK_MAX_Commands_pb.followerRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public follow(request: SPARK_MAX_Commands_pb.followerRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public follow(request: SPARK_MAX_Commands_pb.followerRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public clearFaults(request: SPARK_MAX_Commands_pb.clearFaultsRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.clearFaultsResponse) => void): grpc.ClientUnaryCall;
    public clearFaults(request: SPARK_MAX_Commands_pb.clearFaultsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.clearFaultsResponse) => void): grpc.ClientUnaryCall;
    public clearFaults(request: SPARK_MAX_Commands_pb.clearFaultsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.clearFaultsResponse) => void): grpc.ClientUnaryCall;
    public dRVStatus(request: SPARK_MAX_Commands_pb.DRVStatusRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.DRVStatusResponse) => void): grpc.ClientUnaryCall;
    public dRVStatus(request: SPARK_MAX_Commands_pb.DRVStatusRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.DRVStatusResponse) => void): grpc.ClientUnaryCall;
    public dRVStatus(request: SPARK_MAX_Commands_pb.DRVStatusRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.DRVStatusResponse) => void): grpc.ClientUnaryCall;
    public telemetry(request: SPARK_MAX_Commands_pb.telemetryRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.telemetryResponse) => void): grpc.ClientUnaryCall;
    public telemetry(request: SPARK_MAX_Commands_pb.telemetryRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.telemetryResponse) => void): grpc.ClientUnaryCall;
    public telemetry(request: SPARK_MAX_Commands_pb.telemetryRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.telemetryResponse) => void): grpc.ClientUnaryCall;
    public factoryReset(request: SPARK_MAX_Commands_pb.factoryResetRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public factoryReset(request: SPARK_MAX_Commands_pb.factoryResetRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public factoryReset(request: SPARK_MAX_Commands_pb.factoryResetRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public iDAssignment(request: SPARK_MAX_Commands_pb.idAssignmentRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public iDAssignment(request: SPARK_MAX_Commands_pb.idAssignmentRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public iDAssignment(request: SPARK_MAX_Commands_pb.idAssignmentRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public identify(request: SPARK_MAX_Commands_pb.identifyRequest, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public identify(request: SPARK_MAX_Commands_pb.identifyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
    public identify(request: SPARK_MAX_Commands_pb.identifyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: SPARK_MAX_Commands_pb.rootResponse) => void): grpc.ClientUnaryCall;
}
