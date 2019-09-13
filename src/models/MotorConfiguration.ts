import PIDFProfile from "./PIDFProfile";

export default class MotorConfiguration implements ISerializable {
  private _name: string;

  private _canID: number;
  private _inputMode: number;
  private _type: number;
  private _commutationAdvance: number;
  private _sensorType: number;
  private _controlType: number;
  private _idleMode: number;
  private _inputDeadband: number;
  private _firmwareVersion: string;
  private _hallOffset: number;
  private _polePairs: number;
  private _currentChop: number;
  private _currentChopCycles: number;
  private _controlProfiles: PIDFProfile[];
  private _outputRatio: number;
  private _limitSwitchForwardPolarity: boolean;
  private _limitSwitchReversePolarity: boolean;
  private _hardLimitSwitchForwardEnabled: boolean;
  private _hardLimitSwitchReverseEnabled: boolean;
  private _softLimitSwitchForwardEnabled: boolean;
  private _softLimitSwitchReverseEnabled: boolean;
  private _softLimitForward: number;
  private _softLimitReverse: number;
  private _rampRate: number;
  private _followerID: number;
  private _followerConfig: string;
  private _smartCurrentStallLimit: number;
  private _smartCurrentFreeLimit: number;
  private _smartCurrentConfig: number;
  private _motorKv: number;
  private _motorR: number;
  private _motorL: number;
  private _encoderCountsPerRevolution: number;
  private _encoderAverageDepth: number;
  private _encoderSampleDelta: number;

  constructor(motorName: string, motorType: number) {
    this._name = motorName;
    this._canID = -1;
    this._inputMode = 0;
    this._commutationAdvance = 0;
    this._sensorType = 1;
    this._controlType = 0;
    this._idleMode = 0;
    this._inputDeadband = 0;
    this._firmwareVersion = "0.0.0";
    this._hallOffset = 0;
    this._polePairs = 0;
    this._currentChop = 0;
    this._currentChopCycles = 0;
    this._type = motorType;
    this._controlProfiles = [];
    this._outputRatio = 0;
    this._limitSwitchForwardPolarity = true;
    this._limitSwitchReversePolarity = true;
    this._hardLimitSwitchForwardEnabled = false;
    this._hardLimitSwitchReverseEnabled = false;
    this._softLimitSwitchForwardEnabled = false;
    this._softLimitSwitchReverseEnabled = false;
    this._softLimitForward = 0;
    this._softLimitReverse = 0;
    this._rampRate = 0;
    this._followerID = -1;
    this._followerConfig = "";
    this._smartCurrentStallLimit = 80;
    this._smartCurrentFreeLimit = 0;
    this._smartCurrentConfig = -1;
    this._motorKv = 480;
    this._motorR = 35000;
    this._motorL = 3800;
    this._encoderCountsPerRevolution = 4096;
    this._encoderAverageDepth = 64;
    this._encoderSampleDelta = 200;

    for (let i = 0; i < 4; i++) {
      this._controlProfiles.push(new PIDFProfile());
    }
  }

  public toJSON(): object {
    return {
      name: this.name,
      can_id: this.canID,
      input_mode: this.inputMode,
      type: this.type,
      comm_advance: this.commutationAdvance,
      sensor_type: this.sensorType,
      control_type: this.controlType,
      idle_mode: this.idleMode,
      input_deadband: this.inputDeadband,
      firmware_version: this.firmwareVersion,
      hall_offset: this.hallOffset,
      pole_pairs: this.polePairs,
      current_chop: this.currentChop,
      current_chop_cycles: this.currentChopCycles,
      control_profiles: this.controlProfiles.map((profile: PIDFProfile) => profile.toJSON()),
      output_ratio: this.outputRatio,
      limit_forward_polarity: this.limitSwitchForwardPolarity,
      limit_reverse_polarity: this.limitSwitchReversePolarity,
      hard_limit_forward_enabled: this.hardLimitSwitchForwardEnabled,
      hard_limit_reverse_enabled: this.hardLimitSwitchReverseEnabled,
      soft_limit_forward_enabled: this.softLimitSwitchForwardEnabled,
      soft_limit_reverse_enabled: this.softLimitSwitchReverseEnabled,
      soft_limit_forward: this.softLimitForward,
      soft_limit_reverse: this.softLimitReverse,
      ramp_rate: this.rampRate,
      follower_id: this.followerID,
      follower_config: this.followerConfig,
      smart_current_stall_limit: this.smartCurrentStallLimit,
      smart_current_free_limit: this.smartCurrentFreeLimit,
      smart_current_config: this.smartCurrentConfig,
      motor_kv: this.motorKv,
      motor_r: this.motorR,
      motor_l: this.motorL,
      enc_counts_per_rev: this.encoderCountsPerRevolution,
      enc_avg_depth: this.encoderAverageDepth,
      enc_sample_delta: this.encoderSampleDelta
    };
  }

  public fromJSON(json: any): MotorConfiguration {
    const config: MotorConfiguration = new MotorConfiguration(json.name, json.type);
    config.name = json.name || "UNNAMED CONFIG";
    config.type = json.type;
    config.canID = json.can_id || 0;
    config.inputMode = json.input_mode || 0;
    config.commutationAdvance = json.comm_advance || 0;
    config.sensorType = json.sensor_type;
    config.controlType = json.control_type || 0;
    config.idleMode = json.idle_mode || 0;
    config.inputDeadband = json.input_deadband || 0;
    config.firmwareVersion = json.firmware_version || "0.0.0";
    config.hallOffset = json.hall_offset || 0;
    config.polePairs = json.pole_pairs || 0;
    config.currentChop = json.current_chop || 0;
    config.currentChopCycles = json.current_chop_cycles || 0;
    config.controlProfiles = typeof json.control_profiles !== "undefined" ? json.control_profiles.map((profile: any) => new PIDFProfile().fromJSON(profile)) : [];
    config.outputRatio = json.output_ratio || 0;
    config.limitSwitchForwardPolarity = json.limit_forward_polarity;
    config.limitSwitchReversePolarity = json.limit_reverse_polarity;
    config.hardLimitSwitchForwardEnabled = json.hard_limit_forward_enabled;
    config.hardLimitSwitchReverseEnabled = json.hard_limit_reverse_enabled;
    config.softLimitSwitchForwardEnabled = json.soft_limit_forward_enabled;
    config.softLimitSwitchReverseEnabled = json.soft_limit_reverse_enabled;
    config.softLimitForward = json.soft_limit_forward;
    config.softLimitReverse = json.soft_limit_reverse;
    config.rampRate = json.ramp_rate || 0;
    config.followerID = json.follower_id;
    config.followerConfig = json.follower_config || "";
    config.smartCurrentStallLimit = json.smart_current_stall_limit || 80;
    config.smartCurrentFreeLimit = json.smart_current_free_limit || 0;
    config.smartCurrentConfig = json.smart_current_config || -1;
    config.motorKv = json.motor_kv || 480;
    config.motorR = json.motor_r || 35000;
    config.motorL = json.motor_l || 3800;
    config.encoderCountsPerRevolution = json.enc_counts_per_rev || 4096;
    config.encoderAverageDepth = json.enc_avg_depth || 64;
    config.encoderSampleDelta = json.enc_sample_delta || 200;
    return config;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get canID(): number {
    return this._canID;
  }

  set canID(value: number) {
    this._canID = value;
  }

  get inputMode(): number {
    return this._inputMode;
  }

  set inputMode(value: number) {
    this._inputMode = value;
  }

  get type(): number {
    return this._type;
  }

  set type(value: number) {
    this._type = value;
  }

  get commutationAdvance(): number {
    return this._commutationAdvance;
  }

  set commutationAdvance(value: number) {
    this._commutationAdvance = value;
  }

  get sensorType(): number {
    return this._sensorType;
  }

  set sensorType(value: number) {
    this._sensorType = value;
  }

  get controlType(): number {
    return this._controlType;
  }

  set controlType(value: number) {
    this._controlType = value;
  }

  get idleMode(): number {
    return this._idleMode;
  }

  set idleMode(value: number) {
    this._idleMode = value;
  }

  get inputDeadband(): number {
    return this._inputDeadband;
  }

  set inputDeadband(value: number) {
    this._inputDeadband = value;
  }

  get firmwareVersion(): string {
    return this._firmwareVersion;
  }

  set firmwareVersion(value: string) {
    this._firmwareVersion = value;
  }

  get hallOffset(): number {
    return this._hallOffset;
  }

  set hallOffset(value: number) {
    this._hallOffset = value;
  }

  get polePairs(): number {
    return this._polePairs;
  }

  set polePairs(value: number) {
    this._polePairs = value;
  }

  get currentChop(): number {
    return this._currentChop;
  }

  set currentChop(value: number) {
    this._currentChop = value;
  }

  get currentChopCycles(): number {
    return this._currentChopCycles;
  }

  set currentChopCycles(value: number) {
    this._currentChopCycles = value;
  }

  get controlProfiles(): PIDFProfile[] {
    return this._controlProfiles;
  }

  set controlProfiles(value: PIDFProfile[]) {
    this._controlProfiles = value;
  }

  get outputRatio(): number {
    return this._outputRatio;
  }

  set outputRatio(value: number) {
    this._outputRatio = value;
  }

  get limitSwitchForwardPolarity(): boolean {
    return this._limitSwitchForwardPolarity;
  }

  set limitSwitchForwardPolarity(value: boolean) {
    this._limitSwitchForwardPolarity = value;
  }

  get limitSwitchReversePolarity(): boolean {
    return this._limitSwitchReversePolarity;
  }

  set limitSwitchReversePolarity(value: boolean) {
    this._limitSwitchReversePolarity = value;
  }

  get hardLimitSwitchForwardEnabled(): boolean {
    return this._hardLimitSwitchForwardEnabled;
  }

  set hardLimitSwitchForwardEnabled(value: boolean) {
    this._hardLimitSwitchForwardEnabled = value;
  }

  get hardLimitSwitchReverseEnabled(): boolean {
    return this._hardLimitSwitchReverseEnabled;
  }

  set hardLimitSwitchReverseEnabled(value: boolean) {
    this._hardLimitSwitchReverseEnabled = value;
  }

  get softLimitSwitchForwardEnabled(): boolean {
    return this._softLimitSwitchForwardEnabled;
  }

  set softLimitSwitchForwardEnabled(value: boolean) {
    this._softLimitSwitchForwardEnabled = value;
  }

  get softLimitSwitchReverseEnabled(): boolean {
    return this._softLimitSwitchReverseEnabled;
  }

  set softLimitSwitchReverseEnabled(value: boolean) {
    this._softLimitSwitchReverseEnabled = value;
  }

  get softLimitForward(): number {
    return this._softLimitForward;
  }

  set softLimitForward(value: number) {
    this._softLimitForward = value;
  }

  get softLimitReverse(): number {
    return this._softLimitReverse;
  }

  set softLimitReverse(value: number) {
    this._softLimitReverse = value;
  }

  get rampRate(): number {
    return this._rampRate;
  }

  set rampRate(value: number) {
    this._rampRate = value;
  }

  get followerID(): number {
    return this._followerID;
  }

  set followerID(value: number) {
    this._followerID = value;
  }

  get followerConfig(): string {
    return this._followerConfig;
  }

  set followerConfig(value: string) {
    this._followerConfig = value;
  }
  get smartCurrentStallLimit(): number {
    return this._smartCurrentStallLimit;
  }

  set smartCurrentStallLimit(value: number) {
    this._smartCurrentStallLimit = value;
  }

  get smartCurrentFreeLimit(): number {
    return this._smartCurrentFreeLimit;
  }

  set smartCurrentFreeLimit(value: number) {
    this._smartCurrentFreeLimit = value;
  }

  get smartCurrentConfig(): number {
    return this._smartCurrentConfig;
  }

  set smartCurrentConfig(value: number) {
    this._smartCurrentConfig = value;
  }

  get motorKv(): number {
    return this._motorKv;
  }

  set motorKv(value: number) {
    this._motorKv = value;
  }

  get motorR(): number {
    return this._motorR;
  }

  set motorR(value: number) {
    this._motorR = value;
  }

  get motorL(): number {
    return this._motorL;
  }

  set motorL(value: number) {
    this._motorL = value;
  }

  get encoderCountsPerRevolution(): number {
    return this._encoderCountsPerRevolution;
  }

  set encoderCountsPerRevolution(value: number) {
    this._encoderCountsPerRevolution = value;
  }

  get encoderAverageDepth(): number {
    return this._encoderAverageDepth;
  }

  set encoderAverageDepth(value: number) {
    this._encoderAverageDepth = value;
  }

  get encoderSampleDelta(): number {
    return this._encoderSampleDelta;
  }

  set encoderSampleDelta(value: number) {
    this._encoderSampleDelta = value;
  }
}

export const REV_BRUSHLESS = new MotorConfiguration("Brushless",  1);
export const REV_BRUSHED = new MotorConfiguration("Brushed", 0);

export function getFromID(id: number): MotorConfiguration {
  switch (id) {
    case 0:
      return REV_BRUSHED;
    case 1:
      return REV_BRUSHLESS;
    default:
      return REV_BRUSHLESS;
  }
}