// tslint:disable
// @ts-ignore
import * as SPARK_MAX_Types from "./SPARK-MAX-Types_pb";

export enum MotorType {
  Brushed = 0,
  Brushless = 1,
}

export enum SensorType {
  NoSensor = 0,
  HallSensor = 1,
  Encoder = 2,
  Sensorless = 3,
}

export enum ControlType {
  DutyCycle = 0,
  Velocity = 1,
  Voltage = 2,
  Position = 3,
  SmartMotion = 4,
  Current = 5,
  SmartVelocity = 6,
}

export enum IdleMode {
  Coast = 0,
  Brake = 1,
}

export enum InputMode {
  PWM = 0,
  CAN = 1,
  USB = 2,
}

export enum FaultBits {
  Brownout = 0,
  Overcurrent = 1,
  IWDTReset = 2,
  MotorFault = 3,
  SensorFault = 4,
  Stall = 5,
  EEPROMCRC = 6,
  CANTX = 7,
  CANRX = 8,
  HasReset = 9,
  DRVFault = 10,
  OtherFault = 11,
  SoftLimitFwd = 12,
  SoftLimitRev = 13,
  HardLimitFwd = 14,
  HardLimitRev = 15,
}

export enum ParamType {
  int32 = 0,
  uint32 = 1,
  float32 = 2,
  bool = 3,
}

export enum ParamStatus {
  paramOK = 0,
  InvalidID = 1,
  MismatchType = 2,
  AccessMode = 3,
  Invalid = 4,
  NotImplementedDeprecated = 5,
}

export enum DefinedFollowerID {
  FollowerDisabled = 0,
  FollowerCustom = 25,
  FollowerSparkMax = 26,
}

export enum FollowerSignMode {
  FollowerNoSign = 0,
  FollowerTwosComp = 1,
  FollowerSignMag = 2,
}

export enum ConfigParam {
  kCanID = 0,
  kInputMode = 1,
  kMotorType = 2,
  kCommAdvance = 3,
  kSensorType = 4,
  kCtrlType = 5,
  kIdleMode = 6,
  kInputDeadband = 7,
  kFeedbackSensorPID0 = 8,
  kFeedbackSensorPID1 = 9,
  kPolePairs = 10,
  kCurrentChop = 11,
  kCurrentChopCycles = 12,
  kP_0 = 13,
  kI_0 = 14,
  kD_0 = 15,
  kF_0 = 16,
  kIZone_0 = 17,
  kDFilter_0 = 18,
  kOutputMin_0 = 19,
  kOutputMax_0 = 20,
  kP_1 = 21,
  kI_1 = 22,
  kD_1 = 23,
  kF_1 = 24,
  kIZone_1 = 25,
  kDFilter_1 = 26,
  kOutputMin_1 = 27,
  kOutputMax_1 = 28,
  kP_2 = 29,
  kI_2 = 30,
  kD_2 = 31,
  kF_2 = 32,
  kIZone_2 = 33,
  kDFilter_2 = 34,
  kOutputMin_2 = 35,
  kOutputMax_2 = 36,
  kP_3 = 37,
  kI_3 = 38,
  kD_3 = 39,
  kF_3 = 40,
  kIZone_3 = 41,
  kDFilter_3 = 42,
  kOutputMin_3 = 43,
  kOutputMax_3 = 44,
  kInverted = 45,
  kOutputRatio = 46,
  kSerialNumberLow = 47,
  kSerialNumberMid = 48,
  kSerialNumberHigh = 49,
  kLimitSwitchFwdPolarity = 50,
  kLimitSwitchRevPolarity = 51,
  kHardLimitFwdEn = 52,
  kHardLimitRevEn = 53,
  kSoftLimitFwdEn = 54,
  kSoftLimitRevEn = 55,
  kRampRate = 56,
  kFollowerID = 57,
  kFollowerConfig = 58,
  kSmartCurrentStallLimit = 59,
  kSmartCurrentFreeLimit = 60,
  kSmartCurrentConfig = 61,
  kSmartCurrentReserved = 62,
  kMotorKv = 63,
  kMotorR = 64,
  kMotorL = 65,
  kMotorRsvd1 = 66,
  kMotorRsvd2 = 67,
  kMotorRsvd3 = 68,
  kEncoderCountsPerRev = 69,
  kEncoderAverageDepth = 70,
  kEncoderSampleDelta = 71,
  kEncoderInverted = 72,
  kEncoderRsvd1 = 73,
  kClosedLoopVoltageMode = 74,
  kCompensatedNominalVoltage = 75,
  kSmartMotionMaxVelocity_0 = 76,
  kSmartMotionMaxAccel_0 = 77,
  kSmartMotionMinVelOutput_0 = 78,
  kSmartMotionAllowedClosedLoopError_0 = 79,
  kSmartMotionAccelStrategy_0 = 80,
  kSmartMotionMaxVelocity_1 = 81,
  kSmartMotionMaxAccel_1 = 82,
  kSmartMotionMinVelOutput_1 = 83,
  kSmartMotionAllowedClosedLoopError_1 = 84,
  kSmartMotionAccelStrategy_1 = 85,
  kSmartMotionMaxVelocity_2 = 86,
  kSmartMotionMaxAccel_2 = 87,
  kSmartMotionMinVelOutput_2 = 88,
  kSmartMotionAllowedClosedLoopError_2 = 89,
  kSmartMotionAccelStrategy_2 = 90,
  kSmartMotionMaxVelocity_3 = 91,
  kSmartMotionMaxAccel_3 = 92,
  kSmartMotionMinVelOutput_3 = 93,
  kSmartMotionAllowedClosedLoopError_3 = 94,
  kSmartMotionAccelStrategy_3 = 95,
  kIMaxAccum_0 = 96,
  kSlot3Placeholder1_0 = 97,
  kSlot3Placeholder2_0 = 98,
  kSlot3Placeholder3_0 = 99,
  kIMaxAccum_1 = 100,
  kSlot3Placeholder1_1 = 101,
  kSlot3Placeholder2_1 = 102,
  kSlot3Placeholder3_1 = 103,
  kIMaxAccum_2 = 104,
  kSlot3Placeholder1_2 = 105,
  kSlot3Placeholder2_2 = 106,
  kSlot3Placeholder3_2 = 107,
  kIMaxAccum_3 = 108,
  kSlot3Placeholder1_3 = 109,
  kSlot3Placeholder2_3 = 110,
  kSlot3Placeholder3_3 = 111,
  kPositionConversionFactor = 112,
  kVelocityConversionFactor = 113,
  kClosedLoopRampRate = 114,
  kSoftLimitFwd = 115,
  kSoftLimitRev = 116,
  kSoftLimitRsvd0 = 117,
  kSoftLimitRsvd1 = 118,
  kAnalogPositionConversion = 119,
  kAnalogVelocityConversion = 120,
  kAnalogAverageDepth = 121,
  kAnalogSensorMode = 122,
  kAnalogInverted = 123,
  kAnalogSampleDelta = 124,
  kAnalogRsvd0 = 125,
  kAnalogRsvd1 = 126,
  kDataPortConfig = 127,
  kAltEncoderCountsPerRev = 128,
  kAltEncoderAverageDepth = 129,
  kAltEncoderSampleDelta = 130,
  kAltEncoderInverted = 131,
  kAltEncoderPositionFactor = 132,
  kAltEncoderVelocityFactor = 133,
  kAltEncoderRsvd0 = 134,
  kAltEncoderRsvd1 = 135,
}

export enum ConfigParamTypes {
  kDefault_t = 0,
  kCanID_t = 1,
  kInputMode_t = 1,
  kMotorType_t = 1,
  kCommAdvance_t = 2,
  kSensorType_t = 1,
  kCtrlType_t = 1,
  kIdleMode_t = 1,
  kInputDeadband_t = 2,
  kFeedbackSensorPID0_t = 1,
  kFeedbackSensorPID1_t = 1,
  kPolePairs_t = 1,
  kCurrentChop_t = 2,
  kCurrentChopCycles_t = 1,
  kP_0_t = 2,
  kI_0_t = 2,
  kD_0_t = 2,
  kF_0_t = 2,
  kIZone_0_t = 2,
  kDFilter_0_t = 2,
  kOutputMin_0_t = 2,
  kOutputMax_0_t = 2,
  kP_1_t = 2,
  kI_1_t = 2,
  kD_1_t = 2,
  kF_1_t = 2,
  kIZone_1_t = 2,
  kDFilter_1_t = 2,
  kOutputMin_1_t = 2,
  kOutputMax_1_t = 2,
  kP_2_t = 2,
  kI_2_t = 2,
  kD_2_t = 2,
  kF_2_t = 2,
  kIZone_2_t = 2,
  kDFilter_2_t = 2,
  kOutputMin_2_t = 2,
  kOutputMax_2_t = 2,
  kP_3_t = 2,
  kI_3_t = 2,
  kD_3_t = 2,
  kF_3_t = 2,
  kIZone_3_t = 2,
  kDFilter_3_t = 2,
  kOutputMin_3_t = 2,
  kOutputMax_3_t = 2,
  kInverted_t = 3,
  kOutputRatio_t = 2,
  kSerialNumberLow_t = 1,
  kSerialNumberMid_t = 1,
  kSerialNumberHigh_t = 1,
  kLimitSwitchFwdPolarity_t = 3,
  kLimitSwitchRevPolarity_t = 3,
  kHardLimitFwdEn_t = 3,
  kHardLimitRevEn_t = 3,
  kSoftLimitFwdEn_t = 3,
  kSoftLimitRevEn_t = 3,
  kRampRate_t = 2,
  kFollowerID_t = 1,
  kFollowerConfig_t = 1,
  kSmartCurrentStallLimit_t = 1,
  kSmartCurrentFreeLimit_t = 1,
  kSmartCurrentConfig_t = 1,
  kSmartCurrentReserved_t = 1,
  kMotorKv_t = 1,
  kMotorR_t = 1,
  kMotorL_t = 1,
  kMotorRsvd1_t = 1,
  kMotorRsvd2_t = 1,
  kMotorRsvd3_t = 1,
  kEncoderCountsPerRev_t = 1,
  kEncoderAverageDepth_t = 1,
  kEncoderSampleDelta_t = 1,
  kEncoderInverted_t = 3,
  kEncoderRsvd1_t = 1,
  kClosedLoopVoltageMode_t = 1,
  kCompensatedNominalVoltage_t = 2,
  kSmartMotionMaxVelocity_0_t = 2,
  kSmartMotionMaxAccel_0_t = 2,
  kSmartMotionMinVelOutput_0_t = 2,
  kSmartMotionAllowedClosedLoopError_0_t = 2,
  kSmartMotionAccelStrategy_0_t = 2,
  kSmartMotionMaxVelocity_1_t = 2,
  kSmartMotionMaxAccel_1_t = 2,
  kSmartMotionMinVelOutput_1_t = 2,
  kSmartMotionAllowedClosedLoopError_1_t = 2,
  kSmartMotionAccelStrategy_1_t = 2,
  kSmartMotionMaxVelocity_2_t = 2,
  kSmartMotionMaxAccel_2_t = 2,
  kSmartMotionMinVelOutput_2_t = 2,
  kSmartMotionAllowedClosedLoopError_2_t = 2,
  kSmartMotionAccelStrategy_2_t = 2,
  kSmartMotionMaxVelocity_3_t = 2,
  kSmartMotionMaxAccel_3_t = 2,
  kSmartMotionMinVelOutput_3_t = 2,
  kSmartMotionAllowedClosedLoopError_3_t = 2,
  kSmartMotionAccelStrategy_3_t = 2,
  kIMaxAccum_0_t = 2,
  kSlot3Placeholder1_0_t = 2,
  kSlot3Placeholder2_0_t = 2,
  kSlot3Placeholder3_0_t = 2,
  kIMaxAccum_1_t = 2,
  kSlot3Placeholder1_1_t = 2,
  kSlot3Placeholder2_1_t = 2,
  kSlot3Placeholder3_1_t = 2,
  kIMaxAccum_2_t = 2,
  kSlot3Placeholder1_2_t = 2,
  kSlot3Placeholder2_2_t = 2,
  kSlot3Placeholder3_2_t = 2,
  kIMaxAccum_3_t = 2,
  kSlot3Placeholder1_3_t = 2,
  kSlot3Placeholder2_3_t = 2,
  kSlot3Placeholder3_3_t = 2,
  kPositionConversionFactor_t = 2,
  kVelocityConversionFactor_t = 2,
  kClosedLoopRampRate_t = 2,
  kSoftLimitFwd_t = 2,
  kSoftLimitRev_t = 2,
  kSoftLimitRsvd0_t = 1,
  kSoftLimitRsvd1_t = 1,
  kAnalogPositionConversion_t = 2,
  kAnalogVelocityConversion_t = 2,
  kAnalogAverageDepth_t = 1,
  kAnalogSensorMode_t = 1,
  kAnalogInverted_t = 3,
  kAnalogSampleDelta_t = 1,
  kAnalogRsvd0_t = 1,
  kAnalogRsvd1_t = 1,
  kDataPortConfig_t = 1,
  kAltEncoderCountsPerRev_t = 1,
  kAltEncoderAverageDepth_t = 1,
  kAltEncoderSampleDelta_t = 1,
  kAltEncoderInverted_t = 3,
  kAltEncoderPositionFactor_t = 2,
  kAltEncoderVelocityFactor_t = 2,
  kAltEncoderRsvd0_t = 1,
  kAltEncoderRsvd1_t = 1,
}

export enum ConfigParamGroupName {
  GROUPNAME_Basic = 0,
  GROUPNAME_Motor_Advanced = 1,
  GROUPNAME_Closed_Loop = 2,
  GROUPNAME_Hidden = 3,
  GROUPNAME_Brushless_Config = 4,
  GROUPNAME_Current_Limits = 5,
  GROUPNAME_PIDF_Slot_0 = 6,
  GROUPNAME_PIDF_Slot_1 = 7,
  GROUPNAME_PIDF_Slot_2 = 8,
  GROUPNAME_PIDF_Slot_3 = 9,
  GROUPNAME_Limits = 10,
  GROUPNAME_Follower = 11,
  GROUPNAME_Encoder_Port_Sensor = 12,
  GROUPNAME_Smart_Motion = 13,
  GROUPNAME_Analog_Sensor = 14,
  GROUPNAME_Alternate_Encoder = 15,
}

export enum ConfigParamGroup {
  GROUP_default = 0,
  GROUP_kCanID = 0,
  GROUP_kInputMode = 0,
  GROUP_kMotorType = 0,
  GROUP_kCommAdvance = 1,
  GROUP_kSensorType = 0,
  GROUP_kCtrlType = 2,
  GROUP_kIdleMode = 0,
  GROUP_kInputDeadband = 0,
  GROUP_kFeedbackSensorPID0 = 2,
  GROUP_kFeedbackSensorPID1 = 3,
  GROUP_kPolePairs = 4,
  GROUP_kCurrentChop = 5,
  GROUP_kCurrentChopCycles = 5,
  GROUP_kP_0 = 6,
  GROUP_kI_0 = 6,
  GROUP_kD_0 = 6,
  GROUP_kF_0 = 6,
  GROUP_kIZone_0 = 6,
  GROUP_kDFilter_0 = 6,
  GROUP_kOutputMin_0 = 6,
  GROUP_kOutputMax_0 = 6,
  GROUP_kP_1 = 7,
  GROUP_kI_1 = 7,
  GROUP_kD_1 = 7,
  GROUP_kF_1 = 7,
  GROUP_kIZone_1 = 7,
  GROUP_kDFilter_1 = 7,
  GROUP_kOutputMin_1 = 7,
  GROUP_kOutputMax_1 = 7,
  GROUP_kP_2 = 8,
  GROUP_kI_2 = 8,
  GROUP_kD_2 = 8,
  GROUP_kF_2 = 8,
  GROUP_kIZone_2 = 8,
  GROUP_kDFilter_2 = 8,
  GROUP_kOutputMin_2 = 8,
  GROUP_kOutputMax_2 = 8,
  GROUP_kP_3 = 9,
  GROUP_kI_3 = 9,
  GROUP_kD_3 = 9,
  GROUP_kF_3 = 9,
  GROUP_kIZone_3 = 9,
  GROUP_kDFilter_3 = 9,
  GROUP_kOutputMin_3 = 9,
  GROUP_kOutputMax_3 = 9,
  GROUP_kInverted = 0,
  GROUP_kOutputRatio = 0,
  GROUP_kSerialNumberLow = 3,
  GROUP_kSerialNumberMid = 3,
  GROUP_kSerialNumberHigh = 3,
  GROUP_kLimitSwitchFwdPolarity = 10,
  GROUP_kLimitSwitchRevPolarity = 10,
  GROUP_kHardLimitFwdEn = 10,
  GROUP_kHardLimitRevEn = 10,
  GROUP_kSoftLimitFwdEn = 10,
  GROUP_kSoftLimitRevEn = 10,
  GROUP_kRampRate = 0,
  GROUP_kFollowerID = 11,
  GROUP_kFollowerConfig = 11,
  GROUP_kSmartCurrentStallLimit = 5,
  GROUP_kSmartCurrentFreeLimit = 5,
  GROUP_kSmartCurrentConfig = 5,
  GROUP_kSmartCurrentReserved = 3,
  GROUP_kMotorKv = 1,
  GROUP_kMotorR = 1,
  GROUP_kMotorL = 1,
  GROUP_kMotorRsvd1 = 3,
  GROUP_kMotorRsvd2 = 3,
  GROUP_kMotorRsvd3 = 3,
  GROUP_kEncoderCountsPerRev = 12,
  GROUP_kEncoderAverageDepth = 12,
  GROUP_kEncoderSampleDelta = 12,
  GROUP_kEncoderInverted = 12,
  GROUP_kEncoderRsvd1 = 3,
  GROUP_kClosedLoopVoltageMode = 2,
  GROUP_kCompensatedNominalVoltage = 2,
  GROUP_kSmartMotionMaxVelocity_0 = 13,
  GROUP_kSmartMotionMaxAccel_0 = 13,
  GROUP_kSmartMotionMinVelOutput_0 = 13,
  GROUP_kSmartMotionAllowedClosedLoopError_0 = 13,
  GROUP_kSmartMotionAccelStrategy_0 = 13,
  GROUP_kSmartMotionMaxVelocity_1 = 13,
  GROUP_kSmartMotionMaxAccel_1 = 13,
  GROUP_kSmartMotionMinVelOutput_1 = 13,
  GROUP_kSmartMotionAllowedClosedLoopError_1 = 13,
  GROUP_kSmartMotionAccelStrategy_1 = 13,
  GROUP_kSmartMotionMaxVelocity_2 = 13,
  GROUP_kSmartMotionMaxAccel_2 = 13,
  GROUP_kSmartMotionMinVelOutput_2 = 13,
  GROUP_kSmartMotionAllowedClosedLoopError_2 = 13,
  GROUP_kSmartMotionAccelStrategy_2 = 13,
  GROUP_kSmartMotionMaxVelocity_3 = 13,
  GROUP_kSmartMotionMaxAccel_3 = 13,
  GROUP_kSmartMotionMinVelOutput_3 = 13,
  GROUP_kSmartMotionAllowedClosedLoopError_3 = 13,
  GROUP_kSmartMotionAccelStrategy_3 = 13,
  GROUP_kIMaxAccum_0 = 13,
  GROUP_kSlot3Placeholder1_0 = 13,
  GROUP_kSlot3Placeholder2_0 = 13,
  GROUP_kSlot3Placeholder3_0 = 13,
  GROUP_kIMaxAccum_1 = 13,
  GROUP_kSlot3Placeholder1_1 = 13,
  GROUP_kSlot3Placeholder2_1 = 13,
  GROUP_kSlot3Placeholder3_1 = 13,
  GROUP_kIMaxAccum_2 = 13,
  GROUP_kSlot3Placeholder1_2 = 13,
  GROUP_kSlot3Placeholder2_2 = 13,
  GROUP_kSlot3Placeholder3_2 = 13,
  GROUP_kIMaxAccum_3 = 13,
  GROUP_kSlot3Placeholder1_3 = 13,
  GROUP_kSlot3Placeholder2_3 = 13,
  GROUP_kSlot3Placeholder3_3 = 13,
  GROUP_kPositionConversionFactor = 12,
  GROUP_kVelocityConversionFactor = 12,
  GROUP_kClosedLoopRampRate = 12,
  GROUP_kSoftLimitFwd = 10,
  GROUP_kSoftLimitRev = 10,
  GROUP_kSoftLimitRsvd0 = 3,
  GROUP_kSoftLimitRsvd1 = 3,
  GROUP_kAnalogPositionConversion = 14,
  GROUP_kAnalogVelocityConversion = 14,
  GROUP_kAnalogAverageDepth = 14,
  GROUP_kAnalogSensorMode = 14,
  GROUP_kAnalogInverted = 14,
  GROUP_kAnalogSampleDelta = 14,
  GROUP_kAnalogRsvd0 = 3,
  GROUP_kAnalogRsvd1 = 3,
  GROUP_kDataPortConfig = 15,
  GROUP_kAltEncoderCountsPerRev = 15,
  GROUP_kAltEncoderAverageDepth = 15,
  GROUP_kAltEncoderSampleDelta = 15,
  GROUP_kAltEncoderInverted = 15,
  GROUP_kAltEncoderPositionFactor = 15,
  GROUP_kAltEncoderVelocityFactor = 15,
  GROUP_kAltEncoderRsvd0 = 3,
  GROUP_kAltEncoderRsvd1 = 3,
}

export enum DRVStat0_Bits {
  VDS_LC_Bit = 0,
  VDS_HC_Bit = 1,
  VDS_LB_Bit = 2,
  VDS_HB_Bit = 3,
  VDS_LA_Bit = 4,
  VDS_HA_Bit = 5,
  OTSD_Bit = 6,
  UVLO_Bit = 7,
  GDF_Bit = 8,
  VDS_OCP_Bit = 9,
  FAULT_Bit = 10,
}

export enum DRVStat1_Bits {
  VGS_LC_Bit = 0,
  VGS_HC_Bit = 1,
  VGS_LB_Bit = 2,
  VGS_HB_Bit = 3,
  VGS_LA_Bit = 4,
  VGS_HA_Bit = 5,
  CPUV_Bit = 6,
  OTW_Bit = 7,
  SC_OC_Bit = 8,
  SB_OC_Bit = 9,
  SA_OC_Bit = 10,
}

export function motorTypeFromDto(value: MotorType): SPARK_MAX_Types.motorType {
  return value as unknown as SPARK_MAX_Types.motorType;
}

export function motorTypeToDto(value: SPARK_MAX_Types.motorType): MotorType {
  return value as unknown as MotorType;
}

export function sensorTypeFromDto(value: SensorType): SPARK_MAX_Types.sensorType {
  return value as unknown as SPARK_MAX_Types.sensorType;
}

export function sensorTypeToDto(value: SPARK_MAX_Types.sensorType): SensorType {
  return value as unknown as SensorType;
}

export function controlTypeFromDto(value: ControlType): SPARK_MAX_Types.controlType {
  return value as unknown as SPARK_MAX_Types.controlType;
}

export function controlTypeToDto(value: SPARK_MAX_Types.controlType): ControlType {
  return value as unknown as ControlType;
}

export function idleModeFromDto(value: IdleMode): SPARK_MAX_Types.idleMode {
  return value as unknown as SPARK_MAX_Types.idleMode;
}

export function idleModeToDto(value: SPARK_MAX_Types.idleMode): IdleMode {
  return value as unknown as IdleMode;
}

export function inputModeFromDto(value: InputMode): SPARK_MAX_Types.inputMode {
  return value as unknown as SPARK_MAX_Types.inputMode;
}

export function inputModeToDto(value: SPARK_MAX_Types.inputMode): InputMode {
  return value as unknown as InputMode;
}

export function faultBitsFromDto(value: FaultBits): SPARK_MAX_Types.faultBits {
  return value as unknown as SPARK_MAX_Types.faultBits;
}

export function faultBitsToDto(value: SPARK_MAX_Types.faultBits): FaultBits {
  return value as unknown as FaultBits;
}

export function paramTypeFromDto(value: ParamType): SPARK_MAX_Types.paramType {
  return value as unknown as SPARK_MAX_Types.paramType;
}

export function paramTypeToDto(value: SPARK_MAX_Types.paramType): ParamType {
  return value as unknown as ParamType;
}

export function paramStatusFromDto(value: ParamStatus): SPARK_MAX_Types.paramStatus {
  return value as unknown as SPARK_MAX_Types.paramStatus;
}

export function paramStatusToDto(value: SPARK_MAX_Types.paramStatus): ParamStatus {
  return value as unknown as ParamStatus;
}

export function definedFollowerIdFromDto(value: DefinedFollowerID): SPARK_MAX_Types.definedFollowerID {
  return value as unknown as SPARK_MAX_Types.definedFollowerID;
}

export function definedFollowerIdToDto(value: SPARK_MAX_Types.definedFollowerID): DefinedFollowerID {
  return value as unknown as DefinedFollowerID;
}

export function followerSignModeFromDto(value: FollowerSignMode): SPARK_MAX_Types.followerSignMode {
  return value as unknown as SPARK_MAX_Types.followerSignMode;
}

export function followerSignModeToDto(value: SPARK_MAX_Types.followerSignMode): FollowerSignMode {
  return value as unknown as FollowerSignMode;
}

export function configParamFromDto(value: ConfigParam): SPARK_MAX_Types.configParam {
  return value as unknown as SPARK_MAX_Types.configParam;
}

export function configParamToDto(value: SPARK_MAX_Types.configParam): ConfigParam {
  return value as unknown as ConfigParam;
}

export function configParamTypesFromDto(value: ConfigParamTypes): SPARK_MAX_Types.configParamTypes {
  return value as unknown as SPARK_MAX_Types.configParamTypes;
}

export function configParamTypesToDto(value: SPARK_MAX_Types.configParamTypes): ConfigParamTypes {
  return value as unknown as ConfigParamTypes;
}

export function configParamGroupNameFromDto(value: ConfigParamGroupName): SPARK_MAX_Types.configParamGroupName {
  return value as unknown as SPARK_MAX_Types.configParamGroupName;
}

export function configParamGroupNameToDto(value: SPARK_MAX_Types.configParamGroupName): ConfigParamGroupName {
  return value as unknown as ConfigParamGroupName;
}

export function configParamGroupFromDto(value: ConfigParamGroup): SPARK_MAX_Types.configParamGroup {
  return value as unknown as SPARK_MAX_Types.configParamGroup;
}

export function configParamGroupToDto(value: SPARK_MAX_Types.configParamGroup): ConfigParamGroup {
  return value as unknown as ConfigParamGroup;
}

export function drvStat0BitsFromDto(value: DRVStat0_Bits): SPARK_MAX_Types.DRVStat0_Bits {
  return value as unknown as SPARK_MAX_Types.DRVStat0_Bits;
}

export function drvStat0BitsToDto(value: SPARK_MAX_Types.DRVStat0_Bits): DRVStat0_Bits {
  return value as unknown as DRVStat0_Bits;
}

export function drvStat1BitsFromDto(value: DRVStat1_Bits): SPARK_MAX_Types.DRVStat1_Bits {
  return value as unknown as SPARK_MAX_Types.DRVStat1_Bits;
}

export function drvStat1BitsToDto(value: SPARK_MAX_Types.DRVStat1_Bits): DRVStat1_Bits {
  return value as unknown as DRVStat1_Bits;
}


