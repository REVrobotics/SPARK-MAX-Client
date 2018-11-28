import PIDFProfile from "./PIDFProfile";

export default class MotorConfiguration implements ISerializable {
  private _name: string;

  private _canID: number;
  private _inputMode: number;
  private _type: number;
  private _commutationAdvance: number;
  private _sensorType: string;
  private readonly _controlType: string;
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
    this._type = motorType;
  }

  public toJSON(): object {
    return {};
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

  get sensorType(): string {
    return this._sensorType;
  }

  set sensorType(value: string) {
    this._sensorType = value;
  }

  get controlType(): string {
    return this._controlType;
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

export const REV_BRUSHLESS = new MotorConfiguration("REV Brushless",  1);
export const CIM = new MotorConfiguration("CIM", 0);
export const MINI_CIM = new MotorConfiguration("Mini Cim", 0);
export const PRO = new MotorConfiguration("775 Pro/Redline", 0);
export const BAG = new MotorConfiguration("Bag", 0);
export const REV_HD_HEX = new MotorConfiguration("REV HD Hex", 0);