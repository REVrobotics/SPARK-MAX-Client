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
  private _currentLimit: number;
  private _controlProfiles: PIDFProfile[];
  private _outputRatio: number;
  private _limitSwitchForwardPolarity: number;
  private _limitSwitchReversePolarity: number;
  private _hardLimitSwitchForwardEnabled: boolean;
  private _hardLimitSwitchReverseEnabled: boolean;
  private _softLimitSwitchForwardEnabled: boolean;
  private _softLimitSwitchReverseEnabled: boolean;
  private _rampRate: number;
  private _followerID: number;
  private _followerConfig: string;

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
    this._currentLimit = 0;
    this._type = motorType;
    this._controlProfiles = [];
    this._outputRatio = 0;
    this._limitSwitchForwardPolarity = 0;
    this._limitSwitchReversePolarity = 0;
    this._hardLimitSwitchForwardEnabled = false;
    this._hardLimitSwitchReverseEnabled = false;
    this._softLimitSwitchForwardEnabled = false;
    this._softLimitSwitchReverseEnabled = false;
    this._rampRate = 0;
    this._followerID = -1;
    this._followerConfig = "";
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
      current_limit: this.currentLimit
    };
  }

  public fromJSON(json: any): MotorConfiguration {
    const config: MotorConfiguration = new MotorConfiguration(json.name, json.type);
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

  get currentLimit(): number {
    return this._currentLimit;
  }

  set currentLimit(value: number) {
    this._currentLimit = value;
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

  get limitSwitchForwardPolarity(): number {
    return this._limitSwitchForwardPolarity;
  }

  set limitSwitchForwardPolarity(value: number) {
    this._limitSwitchForwardPolarity = value;
  }

  get limitSwitchReversePolarity(): number {
    return this._limitSwitchReversePolarity;
  }

  set limitSwitchReversePolarity(value: number) {
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