// tslint:disable
// @ts-ignore
import * as SPARK_MAX_TypesDto from "./SPARK-MAX-Types_dto_pb";
// @ts-ignore
import * as SPARK_MAX_Commands from "./SPARK-MAX-Commands_pb";
// @ts-ignore
import * as SPARK_MAX_Types from "./SPARK-MAX-Types_pb";

export enum TelemetryId {
  SensorPosition = 0,
}

export interface ConnectRequestDto {
  device?: string;
}

export interface ConnectResponseDto {
  connected?: boolean;
  root?: RootResponseDto;
}

export interface DisconnectRequestDto {
  device?: string;
}

export interface DisconnectResponseDto {
  connected?: boolean;
  root?: RootResponseDto;
}

export interface PingRequestDto {
  device?: string;
}

export interface PingResponseDto {
  root?: RootResponseDto;
  connected?: boolean;
}

export interface BurnRequestDto {
  root?: RootCommandDto;
}

export interface BurnResponseDto {
  root?: RootResponseDto;
}

export interface RootCommandDto {
  device?: string;
}

export interface RootResponseDto {
  error?: string;
}

export interface ListRequestDto {
  root?: RootCommandDto;
  all?: boolean;
}

export interface ExtendedListResponseDto {
  interfaceName?: string;
  driverName?: string;
  deviceName?: string;
  deviceId?: number;
  updateable?: boolean;
  uniqueId?: number;
}

export interface ListResponseDto {
  deviceList: string[];
  driverList: string[];
  root?: RootResponseDto;
  extendedList: ExtendedListResponseDto[];
}

export interface FirmwareRequestDto {
  root?: RootCommandDto;
  filename?: string;
  devicesToUpdate: string[];
}

export interface FirmwareResponseDto {
  version?: string;
  updateStarted?: boolean;
  root?: RootResponseDto;
  major?: number;
  minor?: number;
  build?: number;
  isDebug?: boolean;
  hardwareVersion?: string;
  isUpdating?: boolean;
  updateStageMessage?: string;
  updateStagePercent?: number;
  updateComplete?: boolean;
  updateCompletedSuccessfully?: boolean;
}

export interface SetParameterRequestDto {
  root?: RootCommandDto;
  parameter?: SPARK_MAX_TypesDto.ConfigParam;
  value?: string;
}

export interface GetParameterRequestDto {
  root?: RootCommandDto;
  parameter?: SPARK_MAX_TypesDto.ConfigParam;
}

export interface ParameterResponseDto {
  value?: string;
  type?: SPARK_MAX_TypesDto.ParamType;
  status?: SPARK_MAX_TypesDto.ParamStatus;
  root?: RootResponseDto;
  number?: number;
}

export interface ParameterListRequestDto {
  root?: RootCommandDto;
}

export interface ParameterListResponseDto {
  parameters: ParameterResponseDto[];
  root?: RootResponseDto;
}

export interface SetpointRequestDto {
  root?: RootCommandDto;
  setpoint?: number;
  enable?: boolean;
  auxSetpoint?: number;
  pidSlot?: number;
}

export interface SetpointResponseDto {
  setpoint?: number;
  isRunning?: boolean;
  root?: RootResponseDto;
}

export interface FollowerRequestDto {
  root?: RootCommandDto;
  followerid?: number;
  followerconfig?: number;
}

export interface ClearFaultsRequestDto {
  root?: RootCommandDto;
}

export interface ClearFaultsResponseDto {
  root?: RootResponseDto;
}

export interface DRVStatusRequestDto {
  root?: RootCommandDto;
}

export interface DRVStatusResponseDto {
  stat0?: DRVStat0Dto;
  stat1?: DRVStat1Dto;
  root?: RootResponseDto;
  faults?: FaultFlagsDto;
  stickyFaults?: FaultFlagsDto;
}

export interface FaultFlagsDto {
  brownout?: boolean;
  overcurrent?: boolean;
  iwdtReset?: boolean;
  motorFault?: boolean;
  sensorFault?: boolean;
  stall?: boolean;
  EEPROMCRC?: boolean;
  CANTX?: boolean;
  CANRX?: boolean;
  hasReset?: boolean;
  drvFault?: boolean;
  otherFault?: boolean;
  softLimitFwd?: boolean;
  softLimitRev?: boolean;
  hardLimitFwd?: boolean;
  hardLimitRev?: boolean;
}

export interface DRVStat0Dto {
  VDS_LC?: boolean;
  VDS_HC?: boolean;
  VDS_LB?: boolean;
  VDS_HB?: boolean;
  VDS_LA?: boolean;
  VDS_HA?: boolean;
  OTSD?: boolean;
  UVLO?: boolean;
  GDF?: boolean;
  VDS_OCP?: boolean;
  FAULT?: boolean;
}

export interface DRVStat1Dto {
  VGS_LC?: boolean;
  VGS_HC?: boolean;
  VGS_LB?: boolean;
  VGS_HB?: boolean;
  VGS_LA?: boolean;
  VGS_HA?: boolean;
  CPUV?: boolean;
  OTW?: boolean;
  SC_OC?: boolean;
  SB_OC?: boolean;
  SA_OC?: boolean;
}

export interface TelemetryDataDto {
  id?: TelemetryId;
  value?: number;
}

export interface TelemetryRequestDto {
  root?: RootCommandDto;
  data?: TelemetryDataDto;
}

export interface TelemetryResponseDto {
  root?: RootResponseDto;
  data: TelemetryDataDto[];
}

export interface FactoryResetRequestDto {
  root?: RootCommandDto;
  fullWipe?: boolean;
  burnAfterWrite?: boolean;
}

export interface IdAssignmentRequestDto {
  root?: RootCommandDto;
  uniqueId?: number;
  canId?: number;
}

export interface IdentifyRequestDto {
  uniqueId?: number;
  canId?: number;
}

export function telemetryIdFromDto(value: TelemetryId): SPARK_MAX_Commands.telemetryId {
  return value as unknown as SPARK_MAX_Commands.telemetryId;
}

export function telemetryIdToDto(value: SPARK_MAX_Commands.telemetryId): TelemetryId {
  return value as unknown as TelemetryId;
}

export function connectRequestFromDto(dto: ConnectRequestDto): SPARK_MAX_Commands.connectRequest {
  const message = new SPARK_MAX_Commands.connectRequest();
  if (dto.device != null) {
    message.setDevice(dto.device);
  }
  return message;
}

export function connectRequestToDto(message: SPARK_MAX_Commands.connectRequest): ConnectRequestDto {
  const dto: ConnectRequestDto = {} as any;
  const field0 = message.getDevice();
  if (field0 != null) {
    dto.device = message.getDevice();
  }
  return dto;
}

export function connectResponseFromDto(dto: ConnectResponseDto): SPARK_MAX_Commands.connectResponse {
  const message = new SPARK_MAX_Commands.connectResponse();
  if (dto.connected != null) {
    message.setConnected(dto.connected);
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  return message;
}

export function connectResponseToDto(message: SPARK_MAX_Commands.connectResponse): ConnectResponseDto {
  const dto: ConnectResponseDto = {} as any;
  const field0 = message.getConnected();
  if (field0 != null) {
    dto.connected = message.getConnected();
  }
  const field1 = message.getRoot();
  if (field1 != null) {
    dto.root = rootResponseToDto(field1);
  }
  return dto;
}

export function disconnectRequestFromDto(dto: DisconnectRequestDto): SPARK_MAX_Commands.disconnectRequest {
  const message = new SPARK_MAX_Commands.disconnectRequest();
  if (dto.device != null) {
    message.setDevice(dto.device);
  }
  return message;
}

export function disconnectRequestToDto(message: SPARK_MAX_Commands.disconnectRequest): DisconnectRequestDto {
  const dto: DisconnectRequestDto = {} as any;
  const field0 = message.getDevice();
  if (field0 != null) {
    dto.device = message.getDevice();
  }
  return dto;
}

export function disconnectResponseFromDto(dto: DisconnectResponseDto): SPARK_MAX_Commands.disconnectResponse {
  const message = new SPARK_MAX_Commands.disconnectResponse();
  if (dto.connected != null) {
    message.setConnected(dto.connected);
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  return message;
}

export function disconnectResponseToDto(message: SPARK_MAX_Commands.disconnectResponse): DisconnectResponseDto {
  const dto: DisconnectResponseDto = {} as any;
  const field0 = message.getConnected();
  if (field0 != null) {
    dto.connected = message.getConnected();
  }
  const field1 = message.getRoot();
  if (field1 != null) {
    dto.root = rootResponseToDto(field1);
  }
  return dto;
}

export function pingRequestFromDto(dto: PingRequestDto): SPARK_MAX_Commands.pingRequest {
  const message = new SPARK_MAX_Commands.pingRequest();
  if (dto.device != null) {
    message.setDevice(dto.device);
  }
  return message;
}

export function pingRequestToDto(message: SPARK_MAX_Commands.pingRequest): PingRequestDto {
  const dto: PingRequestDto = {} as any;
  const field0 = message.getDevice();
  if (field0 != null) {
    dto.device = message.getDevice();
  }
  return dto;
}

export function pingResponseFromDto(dto: PingResponseDto): SPARK_MAX_Commands.pingResponse {
  const message = new SPARK_MAX_Commands.pingResponse();
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  if (dto.connected != null) {
    message.setConnected(dto.connected);
  }
  return message;
}

export function pingResponseToDto(message: SPARK_MAX_Commands.pingResponse): PingResponseDto {
  const dto: PingResponseDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootResponseToDto(field0);
  }
  const field1 = message.getConnected();
  if (field1 != null) {
    dto.connected = message.getConnected();
  }
  return dto;
}

export function burnRequestFromDto(dto: BurnRequestDto): SPARK_MAX_Commands.burnRequest {
  const message = new SPARK_MAX_Commands.burnRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  return message;
}

export function burnRequestToDto(message: SPARK_MAX_Commands.burnRequest): BurnRequestDto {
  const dto: BurnRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  return dto;
}

export function burnResponseFromDto(dto: BurnResponseDto): SPARK_MAX_Commands.burnResponse {
  const message = new SPARK_MAX_Commands.burnResponse();
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  return message;
}

export function burnResponseToDto(message: SPARK_MAX_Commands.burnResponse): BurnResponseDto {
  const dto: BurnResponseDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootResponseToDto(field0);
  }
  return dto;
}

export function rootCommandFromDto(dto: RootCommandDto): SPARK_MAX_Commands.rootCommand {
  const message = new SPARK_MAX_Commands.rootCommand();
  if (dto.device != null) {
    message.setDevice(dto.device);
  }
  return message;
}

export function rootCommandToDto(message: SPARK_MAX_Commands.rootCommand): RootCommandDto {
  const dto: RootCommandDto = {} as any;
  const field0 = message.getDevice();
  if (field0 != null) {
    dto.device = message.getDevice();
  }
  return dto;
}

export function rootResponseFromDto(dto: RootResponseDto): SPARK_MAX_Commands.rootResponse {
  const message = new SPARK_MAX_Commands.rootResponse();
  if (dto.error != null) {
    message.setError(dto.error);
  }
  return message;
}

export function rootResponseToDto(message: SPARK_MAX_Commands.rootResponse): RootResponseDto {
  const dto: RootResponseDto = {} as any;
  const field0 = message.getError();
  if (field0 != null) {
    dto.error = message.getError();
  }
  return dto;
}

export function listRequestFromDto(dto: ListRequestDto): SPARK_MAX_Commands.listRequest {
  const message = new SPARK_MAX_Commands.listRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.all != null) {
    message.setAll(dto.all);
  }
  return message;
}

export function listRequestToDto(message: SPARK_MAX_Commands.listRequest): ListRequestDto {
  const dto: ListRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getAll();
  if (field1 != null) {
    dto.all = message.getAll();
  }
  return dto;
}

export function extendedListResponseFromDto(dto: ExtendedListResponseDto): SPARK_MAX_Commands.extendedListResponse {
  const message = new SPARK_MAX_Commands.extendedListResponse();
  if (dto.interfaceName != null) {
    message.setInterfacename(dto.interfaceName);
  }
  if (dto.driverName != null) {
    message.setDrivername(dto.driverName);
  }
  if (dto.deviceName != null) {
    message.setDevicename(dto.deviceName);
  }
  if (dto.deviceId != null) {
    message.setDeviceid(dto.deviceId);
  }
  if (dto.updateable != null) {
    message.setUpdateable(dto.updateable);
  }
  if (dto.uniqueId != null) {
    message.setUniqueid(dto.uniqueId);
  }
  return message;
}

export function extendedListResponseToDto(message: SPARK_MAX_Commands.extendedListResponse): ExtendedListResponseDto {
  const dto: ExtendedListResponseDto = {} as any;
  const field0 = message.getInterfacename();
  if (field0 != null) {
    dto.interfaceName = message.getInterfacename();
  }
  const field1 = message.getDrivername();
  if (field1 != null) {
    dto.driverName = message.getDrivername();
  }
  const field2 = message.getDevicename();
  if (field2 != null) {
    dto.deviceName = message.getDevicename();
  }
  const field3 = message.getDeviceid();
  if (field3 != null) {
    dto.deviceId = message.getDeviceid();
  }
  const field4 = message.getUpdateable();
  if (field4 != null) {
    dto.updateable = message.getUpdateable();
  }
  const field5 = message.getUniqueid();
  if (field5 != null) {
    dto.uniqueId = message.getUniqueid();
  }
  return dto;
}

export function listResponseFromDto(dto: ListResponseDto): SPARK_MAX_Commands.listResponse {
  const message = new SPARK_MAX_Commands.listResponse();
  if (dto.deviceList != null) {
    message.setDevicelistList(dto.deviceList);
  }
  if (dto.driverList != null) {
    message.setDriverlistList(dto.driverList);
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  if (dto.extendedList != null) {
    message.setExtendedlistList(dto.extendedList.map((item) => extendedListResponseFromDto(item)));
  }
  return message;
}

export function listResponseToDto(message: SPARK_MAX_Commands.listResponse): ListResponseDto {
  const dto: ListResponseDto = {} as any;
  const field0 = message.getDevicelistList();
  if (field0 != null) {
    dto.deviceList = message.getDevicelistList();
  }
  const field1 = message.getDriverlistList();
  if (field1 != null) {
    dto.driverList = message.getDriverlistList();
  }
  const field2 = message.getRoot();
  if (field2 != null) {
    dto.root = rootResponseToDto(field2);
  }
  const field3 = message.getExtendedlistList();
  if (field3 != null) {
    dto.extendedList = field3.map((item) => extendedListResponseToDto(item));
  }
  return dto;
}

export function firmwareRequestFromDto(dto: FirmwareRequestDto): SPARK_MAX_Commands.firmwareRequest {
  const message = new SPARK_MAX_Commands.firmwareRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.filename != null) {
    message.setFilename(dto.filename);
  }
  if (dto.devicesToUpdate != null) {
    message.setDevicestoupdateList(dto.devicesToUpdate);
  }
  return message;
}

export function firmwareRequestToDto(message: SPARK_MAX_Commands.firmwareRequest): FirmwareRequestDto {
  const dto: FirmwareRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getFilename();
  if (field1 != null) {
    dto.filename = message.getFilename();
  }
  const field2 = message.getDevicestoupdateList();
  if (field2 != null) {
    dto.devicesToUpdate = message.getDevicestoupdateList();
  }
  return dto;
}

export function firmwareResponseFromDto(dto: FirmwareResponseDto): SPARK_MAX_Commands.firmwareResponse {
  const message = new SPARK_MAX_Commands.firmwareResponse();
  if (dto.version != null) {
    message.setVersion(dto.version);
  }
  if (dto.updateStarted != null) {
    message.setUpdatestarted(dto.updateStarted);
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  if (dto.major != null) {
    message.setMajor(dto.major);
  }
  if (dto.minor != null) {
    message.setMinor(dto.minor);
  }
  if (dto.build != null) {
    message.setBuild(dto.build);
  }
  if (dto.isDebug != null) {
    message.setIsdebug(dto.isDebug);
  }
  if (dto.hardwareVersion != null) {
    message.setHardwareversion(dto.hardwareVersion);
  }
  if (dto.isUpdating != null) {
    message.setIsupdating(dto.isUpdating);
  }
  if (dto.updateStageMessage != null) {
    message.setUpdatestagemessage(dto.updateStageMessage);
  }
  if (dto.updateStagePercent != null) {
    message.setUpdatestagepercent(dto.updateStagePercent);
  }
  if (dto.updateComplete != null) {
    message.setUpdatecomplete(dto.updateComplete);
  }
  if (dto.updateCompletedSuccessfully != null) {
    message.setUpdatecompletedsuccessfully(dto.updateCompletedSuccessfully);
  }
  return message;
}

export function firmwareResponseToDto(message: SPARK_MAX_Commands.firmwareResponse): FirmwareResponseDto {
  const dto: FirmwareResponseDto = {} as any;
  const field0 = message.getVersion();
  if (field0 != null) {
    dto.version = message.getVersion();
  }
  const field1 = message.getUpdatestarted();
  if (field1 != null) {
    dto.updateStarted = message.getUpdatestarted();
  }
  const field2 = message.getRoot();
  if (field2 != null) {
    dto.root = rootResponseToDto(field2);
  }
  const field3 = message.getMajor();
  if (field3 != null) {
    dto.major = message.getMajor();
  }
  const field4 = message.getMinor();
  if (field4 != null) {
    dto.minor = message.getMinor();
  }
  const field5 = message.getBuild();
  if (field5 != null) {
    dto.build = message.getBuild();
  }
  const field6 = message.getIsdebug();
  if (field6 != null) {
    dto.isDebug = message.getIsdebug();
  }
  const field7 = message.getHardwareversion();
  if (field7 != null) {
    dto.hardwareVersion = message.getHardwareversion();
  }
  const field8 = message.getIsupdating();
  if (field8 != null) {
    dto.isUpdating = message.getIsupdating();
  }
  const field9 = message.getUpdatestagemessage();
  if (field9 != null) {
    dto.updateStageMessage = message.getUpdatestagemessage();
  }
  const field10 = message.getUpdatestagepercent();
  if (field10 != null) {
    dto.updateStagePercent = message.getUpdatestagepercent();
  }
  const field11 = message.getUpdatecomplete();
  if (field11 != null) {
    dto.updateComplete = message.getUpdatecomplete();
  }
  const field12 = message.getUpdatecompletedsuccessfully();
  if (field12 != null) {
    dto.updateCompletedSuccessfully = message.getUpdatecompletedsuccessfully();
  }
  return dto;
}

export function setParameterRequestFromDto(dto: SetParameterRequestDto): SPARK_MAX_Commands.setParameterRequest {
  const message = new SPARK_MAX_Commands.setParameterRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.parameter != null) {
    message.setParameter(SPARK_MAX_TypesDto.configParamFromDto(dto.parameter));
  }
  if (dto.value != null) {
    message.setValue(dto.value);
  }
  return message;
}

export function setParameterRequestToDto(message: SPARK_MAX_Commands.setParameterRequest): SetParameterRequestDto {
  const dto: SetParameterRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getParameter();
  if (field1 != null) {
    dto.parameter = SPARK_MAX_TypesDto.configParamToDto(field1);
  }
  const field2 = message.getValue();
  if (field2 != null) {
    dto.value = message.getValue();
  }
  return dto;
}

export function getParameterRequestFromDto(dto: GetParameterRequestDto): SPARK_MAX_Commands.getParameterRequest {
  const message = new SPARK_MAX_Commands.getParameterRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.parameter != null) {
    message.setParameter(SPARK_MAX_TypesDto.configParamFromDto(dto.parameter));
  }
  return message;
}

export function getParameterRequestToDto(message: SPARK_MAX_Commands.getParameterRequest): GetParameterRequestDto {
  const dto: GetParameterRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getParameter();
  if (field1 != null) {
    dto.parameter = SPARK_MAX_TypesDto.configParamToDto(field1);
  }
  return dto;
}

export function parameterResponseFromDto(dto: ParameterResponseDto): SPARK_MAX_Commands.parameterResponse {
  const message = new SPARK_MAX_Commands.parameterResponse();
  if (dto.value != null) {
    message.setValue(dto.value);
  }
  if (dto.type != null) {
    message.setType(SPARK_MAX_TypesDto.paramTypeFromDto(dto.type));
  }
  if (dto.status != null) {
    message.setStatus(SPARK_MAX_TypesDto.paramStatusFromDto(dto.status));
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  if (dto.number != null) {
    message.setNumber(dto.number);
  }
  return message;
}

export function parameterResponseToDto(message: SPARK_MAX_Commands.parameterResponse): ParameterResponseDto {
  const dto: ParameterResponseDto = {} as any;
  const field0 = message.getValue();
  if (field0 != null) {
    dto.value = message.getValue();
  }
  const field1 = message.getType();
  if (field1 != null) {
    dto.type = SPARK_MAX_TypesDto.paramTypeToDto(field1);
  }
  const field2 = message.getStatus();
  if (field2 != null) {
    dto.status = SPARK_MAX_TypesDto.paramStatusToDto(field2);
  }
  const field3 = message.getRoot();
  if (field3 != null) {
    dto.root = rootResponseToDto(field3);
  }
  const field4 = message.getNumber();
  if (field4 != null) {
    dto.number = message.getNumber();
  }
  return dto;
}

export function parameterListRequestFromDto(dto: ParameterListRequestDto): SPARK_MAX_Commands.parameterListRequest {
  const message = new SPARK_MAX_Commands.parameterListRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  return message;
}

export function parameterListRequestToDto(message: SPARK_MAX_Commands.parameterListRequest): ParameterListRequestDto {
  const dto: ParameterListRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  return dto;
}

export function parameterListResponseFromDto(dto: ParameterListResponseDto): SPARK_MAX_Commands.parameterListResponse {
  const message = new SPARK_MAX_Commands.parameterListResponse();
  if (dto.parameters != null) {
    message.setParametersList(dto.parameters.map((item) => parameterResponseFromDto(item)));
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  return message;
}

export function parameterListResponseToDto(message: SPARK_MAX_Commands.parameterListResponse): ParameterListResponseDto {
  const dto: ParameterListResponseDto = {} as any;
  const field0 = message.getParametersList();
  if (field0 != null) {
    dto.parameters = field0.map((item) => parameterResponseToDto(item));
  }
  const field1 = message.getRoot();
  if (field1 != null) {
    dto.root = rootResponseToDto(field1);
  }
  return dto;
}

export function setpointRequestFromDto(dto: SetpointRequestDto): SPARK_MAX_Commands.setpointRequest {
  const message = new SPARK_MAX_Commands.setpointRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.setpoint != null) {
    message.setSetpoint(dto.setpoint);
  }
  if (dto.enable != null) {
    message.setEnable(dto.enable);
  }
  if (dto.auxSetpoint != null) {
    message.setAuxsetpoint(dto.auxSetpoint);
  }
  if (dto.pidSlot != null) {
    message.setPidslot(dto.pidSlot);
  }
  return message;
}

export function setpointRequestToDto(message: SPARK_MAX_Commands.setpointRequest): SetpointRequestDto {
  const dto: SetpointRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getSetpoint();
  if (field1 != null) {
    dto.setpoint = message.getSetpoint();
  }
  const field2 = message.getEnable();
  if (field2 != null) {
    dto.enable = message.getEnable();
  }
  const field3 = message.getAuxsetpoint();
  if (field3 != null) {
    dto.auxSetpoint = message.getAuxsetpoint();
  }
  const field4 = message.getPidslot();
  if (field4 != null) {
    dto.pidSlot = message.getPidslot();
  }
  return dto;
}

export function setpointResponseFromDto(dto: SetpointResponseDto): SPARK_MAX_Commands.setpointResponse {
  const message = new SPARK_MAX_Commands.setpointResponse();
  if (dto.setpoint != null) {
    message.setSetpoint(dto.setpoint);
  }
  if (dto.isRunning != null) {
    message.setIsrunning(dto.isRunning);
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  return message;
}

export function setpointResponseToDto(message: SPARK_MAX_Commands.setpointResponse): SetpointResponseDto {
  const dto: SetpointResponseDto = {} as any;
  const field0 = message.getSetpoint();
  if (field0 != null) {
    dto.setpoint = message.getSetpoint();
  }
  const field1 = message.getIsrunning();
  if (field1 != null) {
    dto.isRunning = message.getIsrunning();
  }
  const field2 = message.getRoot();
  if (field2 != null) {
    dto.root = rootResponseToDto(field2);
  }
  return dto;
}

export function followerRequestFromDto(dto: FollowerRequestDto): SPARK_MAX_Commands.followerRequest {
  const message = new SPARK_MAX_Commands.followerRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.followerid != null) {
    message.setFollowerid(dto.followerid);
  }
  if (dto.followerconfig != null) {
    message.setFollowerconfig(dto.followerconfig);
  }
  return message;
}

export function followerRequestToDto(message: SPARK_MAX_Commands.followerRequest): FollowerRequestDto {
  const dto: FollowerRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getFollowerid();
  if (field1 != null) {
    dto.followerid = message.getFollowerid();
  }
  const field2 = message.getFollowerconfig();
  if (field2 != null) {
    dto.followerconfig = message.getFollowerconfig();
  }
  return dto;
}

export function clearFaultsRequestFromDto(dto: ClearFaultsRequestDto): SPARK_MAX_Commands.clearFaultsRequest {
  const message = new SPARK_MAX_Commands.clearFaultsRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  return message;
}

export function clearFaultsRequestToDto(message: SPARK_MAX_Commands.clearFaultsRequest): ClearFaultsRequestDto {
  const dto: ClearFaultsRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  return dto;
}

export function clearFaultsResponseFromDto(dto: ClearFaultsResponseDto): SPARK_MAX_Commands.clearFaultsResponse {
  const message = new SPARK_MAX_Commands.clearFaultsResponse();
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  return message;
}

export function clearFaultsResponseToDto(message: SPARK_MAX_Commands.clearFaultsResponse): ClearFaultsResponseDto {
  const dto: ClearFaultsResponseDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootResponseToDto(field0);
  }
  return dto;
}

export function drvStatusRequestFromDto(dto: DRVStatusRequestDto): SPARK_MAX_Commands.DRVStatusRequest {
  const message = new SPARK_MAX_Commands.DRVStatusRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  return message;
}

export function drvStatusRequestToDto(message: SPARK_MAX_Commands.DRVStatusRequest): DRVStatusRequestDto {
  const dto: DRVStatusRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  return dto;
}

export function drvStatusResponseFromDto(dto: DRVStatusResponseDto): SPARK_MAX_Commands.DRVStatusResponse {
  const message = new SPARK_MAX_Commands.DRVStatusResponse();
  if (dto.stat0 != null) {
    message.setStat0(drvStat0FromDto(dto.stat0));
  }
  if (dto.stat1 != null) {
    message.setStat1(drvStat1FromDto(dto.stat1));
  }
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  if (dto.faults != null) {
    message.setFaults(faultFlagsFromDto(dto.faults));
  }
  if (dto.stickyFaults != null) {
    message.setStickyfaults(faultFlagsFromDto(dto.stickyFaults));
  }
  return message;
}

export function drvStatusResponseToDto(message: SPARK_MAX_Commands.DRVStatusResponse): DRVStatusResponseDto {
  const dto: DRVStatusResponseDto = {} as any;
  const field0 = message.getStat0();
  if (field0 != null) {
    dto.stat0 = drvStat0ToDto(field0);
  }
  const field1 = message.getStat1();
  if (field1 != null) {
    dto.stat1 = drvStat1ToDto(field1);
  }
  const field2 = message.getRoot();
  if (field2 != null) {
    dto.root = rootResponseToDto(field2);
  }
  const field3 = message.getFaults();
  if (field3 != null) {
    dto.faults = faultFlagsToDto(field3);
  }
  const field4 = message.getStickyfaults();
  if (field4 != null) {
    dto.stickyFaults = faultFlagsToDto(field4);
  }
  return dto;
}

export function faultFlagsFromDto(dto: FaultFlagsDto): SPARK_MAX_Commands.FaultFlags {
  const message = new SPARK_MAX_Commands.FaultFlags();
  if (dto.brownout != null) {
    message.setBrownout(dto.brownout);
  }
  if (dto.overcurrent != null) {
    message.setOvercurrent(dto.overcurrent);
  }
  if (dto.iwdtReset != null) {
    message.setIwdtreset(dto.iwdtReset);
  }
  if (dto.motorFault != null) {
    message.setMotorfault(dto.motorFault);
  }
  if (dto.sensorFault != null) {
    message.setSensorfault(dto.sensorFault);
  }
  if (dto.stall != null) {
    message.setStall(dto.stall);
  }
  if (dto.EEPROMCRC != null) {
    message.setEepromcrc(dto.EEPROMCRC);
  }
  if (dto.CANTX != null) {
    message.setCantx(dto.CANTX);
  }
  if (dto.CANRX != null) {
    message.setCanrx(dto.CANRX);
  }
  if (dto.hasReset != null) {
    message.setHasreset(dto.hasReset);
  }
  if (dto.drvFault != null) {
    message.setDrvfault(dto.drvFault);
  }
  if (dto.otherFault != null) {
    message.setOtherfault(dto.otherFault);
  }
  if (dto.softLimitFwd != null) {
    message.setSoftlimitfwd(dto.softLimitFwd);
  }
  if (dto.softLimitRev != null) {
    message.setSoftlimitrev(dto.softLimitRev);
  }
  if (dto.hardLimitFwd != null) {
    message.setHardlimitfwd(dto.hardLimitFwd);
  }
  if (dto.hardLimitRev != null) {
    message.setHardlimitrev(dto.hardLimitRev);
  }
  return message;
}

export function faultFlagsToDto(message: SPARK_MAX_Commands.FaultFlags): FaultFlagsDto {
  const dto: FaultFlagsDto = {} as any;
  const field0 = message.getBrownout();
  if (field0 != null) {
    dto.brownout = message.getBrownout();
  }
  const field1 = message.getOvercurrent();
  if (field1 != null) {
    dto.overcurrent = message.getOvercurrent();
  }
  const field2 = message.getIwdtreset();
  if (field2 != null) {
    dto.iwdtReset = message.getIwdtreset();
  }
  const field3 = message.getMotorfault();
  if (field3 != null) {
    dto.motorFault = message.getMotorfault();
  }
  const field4 = message.getSensorfault();
  if (field4 != null) {
    dto.sensorFault = message.getSensorfault();
  }
  const field5 = message.getStall();
  if (field5 != null) {
    dto.stall = message.getStall();
  }
  const field6 = message.getEepromcrc();
  if (field6 != null) {
    dto.EEPROMCRC = message.getEepromcrc();
  }
  const field7 = message.getCantx();
  if (field7 != null) {
    dto.CANTX = message.getCantx();
  }
  const field8 = message.getCanrx();
  if (field8 != null) {
    dto.CANRX = message.getCanrx();
  }
  const field9 = message.getHasreset();
  if (field9 != null) {
    dto.hasReset = message.getHasreset();
  }
  const field10 = message.getDrvfault();
  if (field10 != null) {
    dto.drvFault = message.getDrvfault();
  }
  const field11 = message.getOtherfault();
  if (field11 != null) {
    dto.otherFault = message.getOtherfault();
  }
  const field12 = message.getSoftlimitfwd();
  if (field12 != null) {
    dto.softLimitFwd = message.getSoftlimitfwd();
  }
  const field13 = message.getSoftlimitrev();
  if (field13 != null) {
    dto.softLimitRev = message.getSoftlimitrev();
  }
  const field14 = message.getHardlimitfwd();
  if (field14 != null) {
    dto.hardLimitFwd = message.getHardlimitfwd();
  }
  const field15 = message.getHardlimitrev();
  if (field15 != null) {
    dto.hardLimitRev = message.getHardlimitrev();
  }
  return dto;
}

export function drvStat0FromDto(dto: DRVStat0Dto): SPARK_MAX_Commands.DRVStat0 {
  const message = new SPARK_MAX_Commands.DRVStat0();
  if (dto.VDS_LC != null) {
    message.setVdsLc(dto.VDS_LC);
  }
  if (dto.VDS_HC != null) {
    message.setVdsHc(dto.VDS_HC);
  }
  if (dto.VDS_LB != null) {
    message.setVdsLb(dto.VDS_LB);
  }
  if (dto.VDS_HB != null) {
    message.setVdsHb(dto.VDS_HB);
  }
  if (dto.VDS_LA != null) {
    message.setVdsLa(dto.VDS_LA);
  }
  if (dto.VDS_HA != null) {
    message.setVdsHa(dto.VDS_HA);
  }
  if (dto.OTSD != null) {
    message.setOtsd(dto.OTSD);
  }
  if (dto.UVLO != null) {
    message.setUvlo(dto.UVLO);
  }
  if (dto.GDF != null) {
    message.setGdf(dto.GDF);
  }
  if (dto.VDS_OCP != null) {
    message.setVdsOcp(dto.VDS_OCP);
  }
  if (dto.FAULT != null) {
    message.setFault(dto.FAULT);
  }
  return message;
}

export function drvStat0ToDto(message: SPARK_MAX_Commands.DRVStat0): DRVStat0Dto {
  const dto: DRVStat0Dto = {} as any;
  const field0 = message.getVdsLc();
  if (field0 != null) {
    dto.VDS_LC = message.getVdsLc();
  }
  const field1 = message.getVdsHc();
  if (field1 != null) {
    dto.VDS_HC = message.getVdsHc();
  }
  const field2 = message.getVdsLb();
  if (field2 != null) {
    dto.VDS_LB = message.getVdsLb();
  }
  const field3 = message.getVdsHb();
  if (field3 != null) {
    dto.VDS_HB = message.getVdsHb();
  }
  const field4 = message.getVdsLa();
  if (field4 != null) {
    dto.VDS_LA = message.getVdsLa();
  }
  const field5 = message.getVdsHa();
  if (field5 != null) {
    dto.VDS_HA = message.getVdsHa();
  }
  const field6 = message.getOtsd();
  if (field6 != null) {
    dto.OTSD = message.getOtsd();
  }
  const field7 = message.getUvlo();
  if (field7 != null) {
    dto.UVLO = message.getUvlo();
  }
  const field8 = message.getGdf();
  if (field8 != null) {
    dto.GDF = message.getGdf();
  }
  const field9 = message.getVdsOcp();
  if (field9 != null) {
    dto.VDS_OCP = message.getVdsOcp();
  }
  const field10 = message.getFault();
  if (field10 != null) {
    dto.FAULT = message.getFault();
  }
  return dto;
}

export function drvStat1FromDto(dto: DRVStat1Dto): SPARK_MAX_Commands.DRVStat1 {
  const message = new SPARK_MAX_Commands.DRVStat1();
  if (dto.VGS_LC != null) {
    message.setVgsLc(dto.VGS_LC);
  }
  if (dto.VGS_HC != null) {
    message.setVgsHc(dto.VGS_HC);
  }
  if (dto.VGS_LB != null) {
    message.setVgsLb(dto.VGS_LB);
  }
  if (dto.VGS_HB != null) {
    message.setVgsHb(dto.VGS_HB);
  }
  if (dto.VGS_LA != null) {
    message.setVgsLa(dto.VGS_LA);
  }
  if (dto.VGS_HA != null) {
    message.setVgsHa(dto.VGS_HA);
  }
  if (dto.CPUV != null) {
    message.setCpuv(dto.CPUV);
  }
  if (dto.OTW != null) {
    message.setOtw(dto.OTW);
  }
  if (dto.SC_OC != null) {
    message.setScOc(dto.SC_OC);
  }
  if (dto.SB_OC != null) {
    message.setSbOc(dto.SB_OC);
  }
  if (dto.SA_OC != null) {
    message.setSaOc(dto.SA_OC);
  }
  return message;
}

export function drvStat1ToDto(message: SPARK_MAX_Commands.DRVStat1): DRVStat1Dto {
  const dto: DRVStat1Dto = {} as any;
  const field0 = message.getVgsLc();
  if (field0 != null) {
    dto.VGS_LC = message.getVgsLc();
  }
  const field1 = message.getVgsHc();
  if (field1 != null) {
    dto.VGS_HC = message.getVgsHc();
  }
  const field2 = message.getVgsLb();
  if (field2 != null) {
    dto.VGS_LB = message.getVgsLb();
  }
  const field3 = message.getVgsHb();
  if (field3 != null) {
    dto.VGS_HB = message.getVgsHb();
  }
  const field4 = message.getVgsLa();
  if (field4 != null) {
    dto.VGS_LA = message.getVgsLa();
  }
  const field5 = message.getVgsHa();
  if (field5 != null) {
    dto.VGS_HA = message.getVgsHa();
  }
  const field6 = message.getCpuv();
  if (field6 != null) {
    dto.CPUV = message.getCpuv();
  }
  const field7 = message.getOtw();
  if (field7 != null) {
    dto.OTW = message.getOtw();
  }
  const field8 = message.getScOc();
  if (field8 != null) {
    dto.SC_OC = message.getScOc();
  }
  const field9 = message.getSbOc();
  if (field9 != null) {
    dto.SB_OC = message.getSbOc();
  }
  const field10 = message.getSaOc();
  if (field10 != null) {
    dto.SA_OC = message.getSaOc();
  }
  return dto;
}

export function telemetryDataFromDto(dto: TelemetryDataDto): SPARK_MAX_Commands.telemetryData {
  const message = new SPARK_MAX_Commands.telemetryData();
  if (dto.id != null) {
    message.setId(telemetryIdFromDto(dto.id));
  }
  if (dto.value != null) {
    message.setValue(dto.value);
  }
  return message;
}

export function telemetryDataToDto(message: SPARK_MAX_Commands.telemetryData): TelemetryDataDto {
  const dto: TelemetryDataDto = {} as any;
  const field0 = message.getId();
  if (field0 != null) {
    dto.id = telemetryIdToDto(field0);
  }
  const field1 = message.getValue();
  if (field1 != null) {
    dto.value = message.getValue();
  }
  return dto;
}

export function telemetryRequestFromDto(dto: TelemetryRequestDto): SPARK_MAX_Commands.telemetryRequest {
  const message = new SPARK_MAX_Commands.telemetryRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.data != null) {
    message.setData(telemetryDataFromDto(dto.data));
  }
  return message;
}

export function telemetryRequestToDto(message: SPARK_MAX_Commands.telemetryRequest): TelemetryRequestDto {
  const dto: TelemetryRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getData();
  if (field1 != null) {
    dto.data = telemetryDataToDto(field1);
  }
  return dto;
}

export function telemetryResponseFromDto(dto: TelemetryResponseDto): SPARK_MAX_Commands.telemetryResponse {
  const message = new SPARK_MAX_Commands.telemetryResponse();
  if (dto.root != null) {
    message.setRoot(rootResponseFromDto(dto.root));
  }
  if (dto.data != null) {
    message.setDataList(dto.data.map((item) => telemetryDataFromDto(item)));
  }
  return message;
}

export function telemetryResponseToDto(message: SPARK_MAX_Commands.telemetryResponse): TelemetryResponseDto {
  const dto: TelemetryResponseDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootResponseToDto(field0);
  }
  const field1 = message.getDataList();
  if (field1 != null) {
    dto.data = field1.map((item) => telemetryDataToDto(item));
  }
  return dto;
}

export function factoryResetRequestFromDto(dto: FactoryResetRequestDto): SPARK_MAX_Commands.factoryResetRequest {
  const message = new SPARK_MAX_Commands.factoryResetRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.fullWipe != null) {
    message.setFullwipe(dto.fullWipe);
  }
  if (dto.burnAfterWrite != null) {
    message.setBurnafterwrite(dto.burnAfterWrite);
  }
  return message;
}

export function factoryResetRequestToDto(message: SPARK_MAX_Commands.factoryResetRequest): FactoryResetRequestDto {
  const dto: FactoryResetRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getFullwipe();
  if (field1 != null) {
    dto.fullWipe = message.getFullwipe();
  }
  const field2 = message.getBurnafterwrite();
  if (field2 != null) {
    dto.burnAfterWrite = message.getBurnafterwrite();
  }
  return dto;
}

export function idAssignmentRequestFromDto(dto: IdAssignmentRequestDto): SPARK_MAX_Commands.idAssignmentRequest {
  const message = new SPARK_MAX_Commands.idAssignmentRequest();
  if (dto.root != null) {
    message.setRoot(rootCommandFromDto(dto.root));
  }
  if (dto.uniqueId != null) {
    message.setUniqueid(dto.uniqueId);
  }
  if (dto.canId != null) {
    message.setCanid(dto.canId);
  }
  return message;
}

export function idAssignmentRequestToDto(message: SPARK_MAX_Commands.idAssignmentRequest): IdAssignmentRequestDto {
  const dto: IdAssignmentRequestDto = {} as any;
  const field0 = message.getRoot();
  if (field0 != null) {
    dto.root = rootCommandToDto(field0);
  }
  const field1 = message.getUniqueid();
  if (field1 != null) {
    dto.uniqueId = message.getUniqueid();
  }
  const field2 = message.getCanid();
  if (field2 != null) {
    dto.canId = message.getCanid();
  }
  return dto;
}

export function identifyRequestFromDto(dto: IdentifyRequestDto): SPARK_MAX_Commands.identifyRequest {
  const message = new SPARK_MAX_Commands.identifyRequest();
  if (dto.uniqueId != null) {
    message.setUniqueid(dto.uniqueId);
  }
  if (dto.canId != null) {
    message.setCanid(dto.canId);
  }
  return message;
}

export function identifyRequestToDto(message: SPARK_MAX_Commands.identifyRequest): IdentifyRequestDto {
  const dto: IdentifyRequestDto = {} as any;
  const field0 = message.getUniqueid();
  if (field0 != null) {
    dto.uniqueId = message.getUniqueid();
  }
  const field1 = message.getCanid();
  if (field1 != null) {
    dto.canId = message.getCanid();
  }
  return dto;
}


