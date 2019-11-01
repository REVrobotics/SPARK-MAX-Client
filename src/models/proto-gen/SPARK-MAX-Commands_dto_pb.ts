// tslint:disable
// @ts-ignore
import * as SPARK_MAX_TypesDto from "./SPARK-MAX-Types_dto_pb";

export enum TelemetryStreamCommand {
  StreamNone = 0,
  StreamStart = 1,
  StreamStop = 2,
  StreamAddSignal = 3,
  StreamRemoveSignal = 4,
}

export interface ConnectRequestDto {
  device?: string;
  path?: string;
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
  updateRequired?: boolean;
}

export interface BurnRequestDto {
  root?: RootCommandDto;
}

export interface BurnResponseDto {
  root?: RootResponseDto;
}

export interface RootCommandDto {
  device?: string;
  verbosity?: number;
}

export interface RootResponseDto {
  error?: string;
}

export interface ListRequestDto {
  root?: RootCommandDto;
  all?: boolean;
  pathDescriptor?: string;
}

export interface ExtendedListResponseDto {
  interfaceName?: string;
  driverName?: string;
  deviceName?: string;
  deviceId?: number;
  updateable?: boolean;
  uniqueId?: number;
  driverDesc?: string;
}

export interface ExtendedDfuResponseDto {
  deviceType?: string;
  recoveryMode?: boolean;
  identifier?: string;
}

export interface ListResponseDto {
  deviceList: string[];
  driverList: string[];
  root?: RootResponseDto;
  extendedList: ExtendedListResponseDto[];
  dfuDevice: ExtendedDfuResponseDto[];
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
  enableable?: boolean;
  enableReason?: string;
  settable?: boolean;
  settableReason?: string;
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

export interface TelemetryRequestDto {
  root?: RootCommandDto;
  id?: number;
  updateRateMs?: number;
}

export interface TelemetryResponseDto {
  root?: RootResponseDto;
  deviceId?: string;
  id?: number;
  value?: number;
  timestampMs?: number;
  name?: string;
  units?: string;
  expectedMin?: number;
  expectedMax?: number;
  updateRateMs?: number;
}

export interface TelemetryStreamRequestDto {
  command?: TelemetryStreamCommand;
  config?: TelemetryRequestDto;
}

export interface TelemetryStreamResponseDto {
  root?: RootResponseDto;
  data: TelemetryResponseDto[];
}

export interface TelemetryListRequestDto {
  root?: RootCommandDto;
}

export interface TelemetryListResponseDto {
  root?: RootResponseDto;
  signalsAvailable: TelemetryResponseDto[];
}


