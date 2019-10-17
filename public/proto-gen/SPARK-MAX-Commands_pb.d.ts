// package: sparkmax
// file: SPARK-MAX-Commands.proto

/* tslint:disable */

import * as jspb from "google-protobuf";
import * as SPARK_MAX_Types_pb from "./SPARK-MAX-Types_pb";

export class connectRequest extends jspb.Message { 
    getDevice(): string;
    setDevice(value: string): void;

    getPath(): string;
    setPath(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): connectRequest.AsObject;
    static toObject(includeInstance: boolean, msg: connectRequest): connectRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: connectRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): connectRequest;
    static deserializeBinaryFromReader(message: connectRequest, reader: jspb.BinaryReader): connectRequest;
}

export namespace connectRequest {
    export type AsObject = {
        device: string,
        path: string,
    }
}

export class connectResponse extends jspb.Message { 
    getConnected(): boolean;
    setConnected(value: boolean): void;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): connectResponse.AsObject;
    static toObject(includeInstance: boolean, msg: connectResponse): connectResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: connectResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): connectResponse;
    static deserializeBinaryFromReader(message: connectResponse, reader: jspb.BinaryReader): connectResponse;
}

export namespace connectResponse {
    export type AsObject = {
        connected: boolean,
        root?: rootResponse.AsObject,
    }
}

export class disconnectRequest extends jspb.Message { 
    getDevice(): string;
    setDevice(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): disconnectRequest.AsObject;
    static toObject(includeInstance: boolean, msg: disconnectRequest): disconnectRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: disconnectRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): disconnectRequest;
    static deserializeBinaryFromReader(message: disconnectRequest, reader: jspb.BinaryReader): disconnectRequest;
}

export namespace disconnectRequest {
    export type AsObject = {
        device: string,
    }
}

export class disconnectResponse extends jspb.Message { 
    getConnected(): boolean;
    setConnected(value: boolean): void;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): disconnectResponse.AsObject;
    static toObject(includeInstance: boolean, msg: disconnectResponse): disconnectResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: disconnectResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): disconnectResponse;
    static deserializeBinaryFromReader(message: disconnectResponse, reader: jspb.BinaryReader): disconnectResponse;
}

export namespace disconnectResponse {
    export type AsObject = {
        connected: boolean,
        root?: rootResponse.AsObject,
    }
}

export class pingRequest extends jspb.Message { 
    getDevice(): string;
    setDevice(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): pingRequest.AsObject;
    static toObject(includeInstance: boolean, msg: pingRequest): pingRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: pingRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): pingRequest;
    static deserializeBinaryFromReader(message: pingRequest, reader: jspb.BinaryReader): pingRequest;
}

export namespace pingRequest {
    export type AsObject = {
        device: string,
    }
}

export class pingResponse extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;

    getConnected(): boolean;
    setConnected(value: boolean): void;

    getUpdaterequired(): boolean;
    setUpdaterequired(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): pingResponse.AsObject;
    static toObject(includeInstance: boolean, msg: pingResponse): pingResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: pingResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): pingResponse;
    static deserializeBinaryFromReader(message: pingResponse, reader: jspb.BinaryReader): pingResponse;
}

export namespace pingResponse {
    export type AsObject = {
        root?: rootResponse.AsObject,
        connected: boolean,
        updaterequired: boolean,
    }
}

export class burnRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): burnRequest.AsObject;
    static toObject(includeInstance: boolean, msg: burnRequest): burnRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: burnRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): burnRequest;
    static deserializeBinaryFromReader(message: burnRequest, reader: jspb.BinaryReader): burnRequest;
}

export namespace burnRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
    }
}

export class burnResponse extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): burnResponse.AsObject;
    static toObject(includeInstance: boolean, msg: burnResponse): burnResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: burnResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): burnResponse;
    static deserializeBinaryFromReader(message: burnResponse, reader: jspb.BinaryReader): burnResponse;
}

export namespace burnResponse {
    export type AsObject = {
        root?: rootResponse.AsObject,
    }
}

export class rootCommand extends jspb.Message { 
    getDevice(): string;
    setDevice(value: string): void;

    getVerbosity(): number;
    setVerbosity(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): rootCommand.AsObject;
    static toObject(includeInstance: boolean, msg: rootCommand): rootCommand.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: rootCommand, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): rootCommand;
    static deserializeBinaryFromReader(message: rootCommand, reader: jspb.BinaryReader): rootCommand;
}

export namespace rootCommand {
    export type AsObject = {
        device: string,
        verbosity: number,
    }
}

export class rootResponse extends jspb.Message { 
    getError(): string;
    setError(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): rootResponse.AsObject;
    static toObject(includeInstance: boolean, msg: rootResponse): rootResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: rootResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): rootResponse;
    static deserializeBinaryFromReader(message: rootResponse, reader: jspb.BinaryReader): rootResponse;
}

export namespace rootResponse {
    export type AsObject = {
        error: string,
    }
}

export class listRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getAll(): boolean;
    setAll(value: boolean): void;

    getPathdescriptor(): string;
    setPathdescriptor(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): listRequest.AsObject;
    static toObject(includeInstance: boolean, msg: listRequest): listRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: listRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): listRequest;
    static deserializeBinaryFromReader(message: listRequest, reader: jspb.BinaryReader): listRequest;
}

export namespace listRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        all: boolean,
        pathdescriptor: string,
    }
}

export class extendedListResponse extends jspb.Message { 
    getInterfacename(): string;
    setInterfacename(value: string): void;

    getDrivername(): string;
    setDrivername(value: string): void;

    getDevicename(): string;
    setDevicename(value: string): void;

    getDeviceid(): number;
    setDeviceid(value: number): void;

    getUpdateable(): boolean;
    setUpdateable(value: boolean): void;

    getUniqueid(): number;
    setUniqueid(value: number): void;

    getDriverdesc(): string;
    setDriverdesc(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): extendedListResponse.AsObject;
    static toObject(includeInstance: boolean, msg: extendedListResponse): extendedListResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: extendedListResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): extendedListResponse;
    static deserializeBinaryFromReader(message: extendedListResponse, reader: jspb.BinaryReader): extendedListResponse;
}

export namespace extendedListResponse {
    export type AsObject = {
        interfacename: string,
        drivername: string,
        devicename: string,
        deviceid: number,
        updateable: boolean,
        uniqueid: number,
        driverdesc: string,
    }
}

export class extendedDfuResponse extends jspb.Message { 
    getDevicetype(): string;
    setDevicetype(value: string): void;

    getRecoverymode(): boolean;
    setRecoverymode(value: boolean): void;

    getIdentifier(): string;
    setIdentifier(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): extendedDfuResponse.AsObject;
    static toObject(includeInstance: boolean, msg: extendedDfuResponse): extendedDfuResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: extendedDfuResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): extendedDfuResponse;
    static deserializeBinaryFromReader(message: extendedDfuResponse, reader: jspb.BinaryReader): extendedDfuResponse;
}

export namespace extendedDfuResponse {
    export type AsObject = {
        devicetype: string,
        recoverymode: boolean,
        identifier: string,
    }
}

export class listResponse extends jspb.Message { 
    clearDevicelistList(): void;
    getDevicelistList(): Array<string>;
    setDevicelistList(value: Array<string>): void;
    addDevicelist(value: string, index?: number): string;

    clearDriverlistList(): void;
    getDriverlistList(): Array<string>;
    setDriverlistList(value: Array<string>): void;
    addDriverlist(value: string, index?: number): string;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;

    clearExtendedlistList(): void;
    getExtendedlistList(): Array<extendedListResponse>;
    setExtendedlistList(value: Array<extendedListResponse>): void;
    addExtendedlist(value?: extendedListResponse, index?: number): extendedListResponse;

    clearDfudeviceList(): void;
    getDfudeviceList(): Array<extendedDfuResponse>;
    setDfudeviceList(value: Array<extendedDfuResponse>): void;
    addDfudevice(value?: extendedDfuResponse, index?: number): extendedDfuResponse;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): listResponse.AsObject;
    static toObject(includeInstance: boolean, msg: listResponse): listResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: listResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): listResponse;
    static deserializeBinaryFromReader(message: listResponse, reader: jspb.BinaryReader): listResponse;
}

export namespace listResponse {
    export type AsObject = {
        devicelistList: Array<string>,
        driverlistList: Array<string>,
        root?: rootResponse.AsObject,
        extendedlistList: Array<extendedListResponse.AsObject>,
        dfudeviceList: Array<extendedDfuResponse.AsObject>,
    }
}

export class firmwareRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getFilename(): string;
    setFilename(value: string): void;

    clearDevicestoupdateList(): void;
    getDevicestoupdateList(): Array<string>;
    setDevicestoupdateList(value: Array<string>): void;
    addDevicestoupdate(value: string, index?: number): string;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): firmwareRequest.AsObject;
    static toObject(includeInstance: boolean, msg: firmwareRequest): firmwareRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: firmwareRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): firmwareRequest;
    static deserializeBinaryFromReader(message: firmwareRequest, reader: jspb.BinaryReader): firmwareRequest;
}

export namespace firmwareRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        filename: string,
        devicestoupdateList: Array<string>,
    }
}

export class firmwareResponse extends jspb.Message { 
    getVersion(): string;
    setVersion(value: string): void;

    getUpdatestarted(): boolean;
    setUpdatestarted(value: boolean): void;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;

    getMajor(): number;
    setMajor(value: number): void;

    getMinor(): number;
    setMinor(value: number): void;

    getBuild(): number;
    setBuild(value: number): void;

    getIsdebug(): boolean;
    setIsdebug(value: boolean): void;

    getHardwareversion(): string;
    setHardwareversion(value: string): void;

    getIsupdating(): boolean;
    setIsupdating(value: boolean): void;

    getUpdatestagemessage(): string;
    setUpdatestagemessage(value: string): void;

    getUpdatestagepercent(): number;
    setUpdatestagepercent(value: number): void;

    getUpdatecomplete(): boolean;
    setUpdatecomplete(value: boolean): void;

    getUpdatecompletedsuccessfully(): boolean;
    setUpdatecompletedsuccessfully(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): firmwareResponse.AsObject;
    static toObject(includeInstance: boolean, msg: firmwareResponse): firmwareResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: firmwareResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): firmwareResponse;
    static deserializeBinaryFromReader(message: firmwareResponse, reader: jspb.BinaryReader): firmwareResponse;
}

export namespace firmwareResponse {
    export type AsObject = {
        version: string,
        updatestarted: boolean,
        root?: rootResponse.AsObject,
        major: number,
        minor: number,
        build: number,
        isdebug: boolean,
        hardwareversion: string,
        isupdating: boolean,
        updatestagemessage: string,
        updatestagepercent: number,
        updatecomplete: boolean,
        updatecompletedsuccessfully: boolean,
    }
}

export class setParameterRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getParameter(): SPARK_MAX_Types_pb.configParam;
    setParameter(value: SPARK_MAX_Types_pb.configParam): void;

    getValue(): string;
    setValue(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): setParameterRequest.AsObject;
    static toObject(includeInstance: boolean, msg: setParameterRequest): setParameterRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: setParameterRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): setParameterRequest;
    static deserializeBinaryFromReader(message: setParameterRequest, reader: jspb.BinaryReader): setParameterRequest;
}

export namespace setParameterRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        parameter: SPARK_MAX_Types_pb.configParam,
        value: string,
    }
}

export class getParameterRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getParameter(): SPARK_MAX_Types_pb.configParam;
    setParameter(value: SPARK_MAX_Types_pb.configParam): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): getParameterRequest.AsObject;
    static toObject(includeInstance: boolean, msg: getParameterRequest): getParameterRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: getParameterRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): getParameterRequest;
    static deserializeBinaryFromReader(message: getParameterRequest, reader: jspb.BinaryReader): getParameterRequest;
}

export namespace getParameterRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        parameter: SPARK_MAX_Types_pb.configParam,
    }
}

export class parameterResponse extends jspb.Message { 
    getValue(): string;
    setValue(value: string): void;

    getType(): SPARK_MAX_Types_pb.paramType;
    setType(value: SPARK_MAX_Types_pb.paramType): void;

    getStatus(): SPARK_MAX_Types_pb.paramStatus;
    setStatus(value: SPARK_MAX_Types_pb.paramStatus): void;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;

    getNumber(): number;
    setNumber(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): parameterResponse.AsObject;
    static toObject(includeInstance: boolean, msg: parameterResponse): parameterResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: parameterResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): parameterResponse;
    static deserializeBinaryFromReader(message: parameterResponse, reader: jspb.BinaryReader): parameterResponse;
}

export namespace parameterResponse {
    export type AsObject = {
        value: string,
        type: SPARK_MAX_Types_pb.paramType,
        status: SPARK_MAX_Types_pb.paramStatus,
        root?: rootResponse.AsObject,
        number: number,
    }
}

export class parameterListRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): parameterListRequest.AsObject;
    static toObject(includeInstance: boolean, msg: parameterListRequest): parameterListRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: parameterListRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): parameterListRequest;
    static deserializeBinaryFromReader(message: parameterListRequest, reader: jspb.BinaryReader): parameterListRequest;
}

export namespace parameterListRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
    }
}

export class parameterListResponse extends jspb.Message { 
    clearParametersList(): void;
    getParametersList(): Array<parameterResponse>;
    setParametersList(value: Array<parameterResponse>): void;
    addParameters(value?: parameterResponse, index?: number): parameterResponse;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): parameterListResponse.AsObject;
    static toObject(includeInstance: boolean, msg: parameterListResponse): parameterListResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: parameterListResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): parameterListResponse;
    static deserializeBinaryFromReader(message: parameterListResponse, reader: jspb.BinaryReader): parameterListResponse;
}

export namespace parameterListResponse {
    export type AsObject = {
        parametersList: Array<parameterResponse.AsObject>,
        root?: rootResponse.AsObject,
    }
}

export class setpointRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getSetpoint(): number;
    setSetpoint(value: number): void;

    getEnable(): boolean;
    setEnable(value: boolean): void;

    getAuxsetpoint(): number;
    setAuxsetpoint(value: number): void;

    getPidslot(): number;
    setPidslot(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): setpointRequest.AsObject;
    static toObject(includeInstance: boolean, msg: setpointRequest): setpointRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: setpointRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): setpointRequest;
    static deserializeBinaryFromReader(message: setpointRequest, reader: jspb.BinaryReader): setpointRequest;
}

export namespace setpointRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        setpoint: number,
        enable: boolean,
        auxsetpoint: number,
        pidslot: number,
    }
}

export class setpointResponse extends jspb.Message { 
    getSetpoint(): number;
    setSetpoint(value: number): void;

    getIsrunning(): boolean;
    setIsrunning(value: boolean): void;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): setpointResponse.AsObject;
    static toObject(includeInstance: boolean, msg: setpointResponse): setpointResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: setpointResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): setpointResponse;
    static deserializeBinaryFromReader(message: setpointResponse, reader: jspb.BinaryReader): setpointResponse;
}

export namespace setpointResponse {
    export type AsObject = {
        setpoint: number,
        isrunning: boolean,
        root?: rootResponse.AsObject,
    }
}

export class followerRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getFollowerid(): number;
    setFollowerid(value: number): void;

    getFollowerconfig(): number;
    setFollowerconfig(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): followerRequest.AsObject;
    static toObject(includeInstance: boolean, msg: followerRequest): followerRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: followerRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): followerRequest;
    static deserializeBinaryFromReader(message: followerRequest, reader: jspb.BinaryReader): followerRequest;
}

export namespace followerRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        followerid: number,
        followerconfig: number,
    }
}

export class clearFaultsRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): clearFaultsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: clearFaultsRequest): clearFaultsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: clearFaultsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): clearFaultsRequest;
    static deserializeBinaryFromReader(message: clearFaultsRequest, reader: jspb.BinaryReader): clearFaultsRequest;
}

export namespace clearFaultsRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
    }
}

export class clearFaultsResponse extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): clearFaultsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: clearFaultsResponse): clearFaultsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: clearFaultsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): clearFaultsResponse;
    static deserializeBinaryFromReader(message: clearFaultsResponse, reader: jspb.BinaryReader): clearFaultsResponse;
}

export namespace clearFaultsResponse {
    export type AsObject = {
        root?: rootResponse.AsObject,
    }
}

export class DRVStatusRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DRVStatusRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DRVStatusRequest): DRVStatusRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DRVStatusRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DRVStatusRequest;
    static deserializeBinaryFromReader(message: DRVStatusRequest, reader: jspb.BinaryReader): DRVStatusRequest;
}

export namespace DRVStatusRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
    }
}

export class DRVStatusResponse extends jspb.Message { 

    hasStat0(): boolean;
    clearStat0(): void;
    getStat0(): DRVStat0 | undefined;
    setStat0(value?: DRVStat0): void;


    hasStat1(): boolean;
    clearStat1(): void;
    getStat1(): DRVStat1 | undefined;
    setStat1(value?: DRVStat1): void;


    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;


    hasFaults(): boolean;
    clearFaults(): void;
    getFaults(): FaultFlags | undefined;
    setFaults(value?: FaultFlags): void;


    hasStickyfaults(): boolean;
    clearStickyfaults(): void;
    getStickyfaults(): FaultFlags | undefined;
    setStickyfaults(value?: FaultFlags): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DRVStatusResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DRVStatusResponse): DRVStatusResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DRVStatusResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DRVStatusResponse;
    static deserializeBinaryFromReader(message: DRVStatusResponse, reader: jspb.BinaryReader): DRVStatusResponse;
}

export namespace DRVStatusResponse {
    export type AsObject = {
        stat0?: DRVStat0.AsObject,
        stat1?: DRVStat1.AsObject,
        root?: rootResponse.AsObject,
        faults?: FaultFlags.AsObject,
        stickyfaults?: FaultFlags.AsObject,
    }
}

export class FaultFlags extends jspb.Message { 
    getBrownout(): boolean;
    setBrownout(value: boolean): void;

    getOvercurrent(): boolean;
    setOvercurrent(value: boolean): void;

    getIwdtreset(): boolean;
    setIwdtreset(value: boolean): void;

    getMotorfault(): boolean;
    setMotorfault(value: boolean): void;

    getSensorfault(): boolean;
    setSensorfault(value: boolean): void;

    getStall(): boolean;
    setStall(value: boolean): void;

    getEepromcrc(): boolean;
    setEepromcrc(value: boolean): void;

    getCantx(): boolean;
    setCantx(value: boolean): void;

    getCanrx(): boolean;
    setCanrx(value: boolean): void;

    getHasreset(): boolean;
    setHasreset(value: boolean): void;

    getDrvfault(): boolean;
    setDrvfault(value: boolean): void;

    getOtherfault(): boolean;
    setOtherfault(value: boolean): void;

    getSoftlimitfwd(): boolean;
    setSoftlimitfwd(value: boolean): void;

    getSoftlimitrev(): boolean;
    setSoftlimitrev(value: boolean): void;

    getHardlimitfwd(): boolean;
    setHardlimitfwd(value: boolean): void;

    getHardlimitrev(): boolean;
    setHardlimitrev(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FaultFlags.AsObject;
    static toObject(includeInstance: boolean, msg: FaultFlags): FaultFlags.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FaultFlags, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FaultFlags;
    static deserializeBinaryFromReader(message: FaultFlags, reader: jspb.BinaryReader): FaultFlags;
}

export namespace FaultFlags {
    export type AsObject = {
        brownout: boolean,
        overcurrent: boolean,
        iwdtreset: boolean,
        motorfault: boolean,
        sensorfault: boolean,
        stall: boolean,
        eepromcrc: boolean,
        cantx: boolean,
        canrx: boolean,
        hasreset: boolean,
        drvfault: boolean,
        otherfault: boolean,
        softlimitfwd: boolean,
        softlimitrev: boolean,
        hardlimitfwd: boolean,
        hardlimitrev: boolean,
    }
}

export class DRVStat0 extends jspb.Message { 
    getVdsLc(): boolean;
    setVdsLc(value: boolean): void;

    getVdsHc(): boolean;
    setVdsHc(value: boolean): void;

    getVdsLb(): boolean;
    setVdsLb(value: boolean): void;

    getVdsHb(): boolean;
    setVdsHb(value: boolean): void;

    getVdsLa(): boolean;
    setVdsLa(value: boolean): void;

    getVdsHa(): boolean;
    setVdsHa(value: boolean): void;

    getOtsd(): boolean;
    setOtsd(value: boolean): void;

    getUvlo(): boolean;
    setUvlo(value: boolean): void;

    getGdf(): boolean;
    setGdf(value: boolean): void;

    getVdsOcp(): boolean;
    setVdsOcp(value: boolean): void;

    getFault(): boolean;
    setFault(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DRVStat0.AsObject;
    static toObject(includeInstance: boolean, msg: DRVStat0): DRVStat0.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DRVStat0, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DRVStat0;
    static deserializeBinaryFromReader(message: DRVStat0, reader: jspb.BinaryReader): DRVStat0;
}

export namespace DRVStat0 {
    export type AsObject = {
        vdsLc: boolean,
        vdsHc: boolean,
        vdsLb: boolean,
        vdsHb: boolean,
        vdsLa: boolean,
        vdsHa: boolean,
        otsd: boolean,
        uvlo: boolean,
        gdf: boolean,
        vdsOcp: boolean,
        fault: boolean,
    }
}

export class DRVStat1 extends jspb.Message { 
    getVgsLc(): boolean;
    setVgsLc(value: boolean): void;

    getVgsHc(): boolean;
    setVgsHc(value: boolean): void;

    getVgsLb(): boolean;
    setVgsLb(value: boolean): void;

    getVgsHb(): boolean;
    setVgsHb(value: boolean): void;

    getVgsLa(): boolean;
    setVgsLa(value: boolean): void;

    getVgsHa(): boolean;
    setVgsHa(value: boolean): void;

    getCpuv(): boolean;
    setCpuv(value: boolean): void;

    getOtw(): boolean;
    setOtw(value: boolean): void;

    getScOc(): boolean;
    setScOc(value: boolean): void;

    getSbOc(): boolean;
    setSbOc(value: boolean): void;

    getSaOc(): boolean;
    setSaOc(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DRVStat1.AsObject;
    static toObject(includeInstance: boolean, msg: DRVStat1): DRVStat1.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DRVStat1, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DRVStat1;
    static deserializeBinaryFromReader(message: DRVStat1, reader: jspb.BinaryReader): DRVStat1;
}

export namespace DRVStat1 {
    export type AsObject = {
        vgsLc: boolean,
        vgsHc: boolean,
        vgsLb: boolean,
        vgsHb: boolean,
        vgsLa: boolean,
        vgsHa: boolean,
        cpuv: boolean,
        otw: boolean,
        scOc: boolean,
        sbOc: boolean,
        saOc: boolean,
    }
}

export class telemetryData extends jspb.Message { 
    getId(): telemetryId;
    setId(value: telemetryId): void;

    getValue(): number;
    setValue(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): telemetryData.AsObject;
    static toObject(includeInstance: boolean, msg: telemetryData): telemetryData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: telemetryData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): telemetryData;
    static deserializeBinaryFromReader(message: telemetryData, reader: jspb.BinaryReader): telemetryData;
}

export namespace telemetryData {
    export type AsObject = {
        id: telemetryId,
        value: number,
    }
}

export class telemetryRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;


    hasData(): boolean;
    clearData(): void;
    getData(): telemetryData | undefined;
    setData(value?: telemetryData): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): telemetryRequest.AsObject;
    static toObject(includeInstance: boolean, msg: telemetryRequest): telemetryRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: telemetryRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): telemetryRequest;
    static deserializeBinaryFromReader(message: telemetryRequest, reader: jspb.BinaryReader): telemetryRequest;
}

export namespace telemetryRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        data?: telemetryData.AsObject,
    }
}

export class telemetryResponse extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootResponse | undefined;
    setRoot(value?: rootResponse): void;

    clearDataList(): void;
    getDataList(): Array<telemetryData>;
    setDataList(value: Array<telemetryData>): void;
    addData(value?: telemetryData, index?: number): telemetryData;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): telemetryResponse.AsObject;
    static toObject(includeInstance: boolean, msg: telemetryResponse): telemetryResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: telemetryResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): telemetryResponse;
    static deserializeBinaryFromReader(message: telemetryResponse, reader: jspb.BinaryReader): telemetryResponse;
}

export namespace telemetryResponse {
    export type AsObject = {
        root?: rootResponse.AsObject,
        dataList: Array<telemetryData.AsObject>,
    }
}

export class factoryResetRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getFullwipe(): boolean;
    setFullwipe(value: boolean): void;

    getBurnafterwrite(): boolean;
    setBurnafterwrite(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): factoryResetRequest.AsObject;
    static toObject(includeInstance: boolean, msg: factoryResetRequest): factoryResetRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: factoryResetRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): factoryResetRequest;
    static deserializeBinaryFromReader(message: factoryResetRequest, reader: jspb.BinaryReader): factoryResetRequest;
}

export namespace factoryResetRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        fullwipe: boolean,
        burnafterwrite: boolean,
    }
}

export class idAssignmentRequest extends jspb.Message { 

    hasRoot(): boolean;
    clearRoot(): void;
    getRoot(): rootCommand | undefined;
    setRoot(value?: rootCommand): void;

    getUniqueid(): number;
    setUniqueid(value: number): void;

    getCanid(): number;
    setCanid(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): idAssignmentRequest.AsObject;
    static toObject(includeInstance: boolean, msg: idAssignmentRequest): idAssignmentRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: idAssignmentRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): idAssignmentRequest;
    static deserializeBinaryFromReader(message: idAssignmentRequest, reader: jspb.BinaryReader): idAssignmentRequest;
}

export namespace idAssignmentRequest {
    export type AsObject = {
        root?: rootCommand.AsObject,
        uniqueid: number,
        canid: number,
    }
}

export class identifyRequest extends jspb.Message { 
    getUniqueid(): number;
    setUniqueid(value: number): void;

    getCanid(): number;
    setCanid(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): identifyRequest.AsObject;
    static toObject(includeInstance: boolean, msg: identifyRequest): identifyRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: identifyRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): identifyRequest;
    static deserializeBinaryFromReader(message: identifyRequest, reader: jspb.BinaryReader): identifyRequest;
}

export namespace identifyRequest {
    export type AsObject = {
        uniqueid: number,
        canid: number,
    }
}

export enum telemetryId {
    SENSORPOSITION = 0,
}
