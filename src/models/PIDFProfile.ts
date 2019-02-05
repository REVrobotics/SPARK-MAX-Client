export default class PIDFProfile implements ISerializable {
  private _p: number;
  private _i: number;
  private _d: number;
  private _f: number;
  private _iZone: number;
  private _dFilter: number;
  private _minOutput: number;
  private _maxOutput: number;

  constructor() {
    this._p = 0;
    this._i = 0;
    this._d = 0;
    this._f = 0;
    this._iZone = 0;
    this._dFilter = 0;
    this._minOutput = 0;
    this._maxOutput = 1.0;
  }

  public toJSON(): object {
    return {
      p: this.p,
      i: this.i,
      d: this.d,
      f: this.f,
      i_zone: this.iZone,
      d_filter: this.dFilter,
      min_output: this.minOutput,
      max_output: this.maxOutput
    };
  }

  public fromJSON(json: any): PIDFProfile {
    const profile: PIDFProfile = new PIDFProfile();
    profile.p = json.p || 0;
    profile.i = json.i || 0;
    profile.d = json.d || 0;
    profile.f = json.f || 0;
    profile.iZone = json.i_zone || 0;
    profile.dFilter = json.d_filter || 0;
    profile.minOutput = json.min_output || 0;
    profile.maxOutput = json.max_output || 1.0;
    return profile;
  }

  get p(): number {
    return this._p;
  }

  set p(value: number) {
    this._p = value;
  }

  get i(): number {
    return this._i;
  }

  set i(value: number) {
    this._i = value;
  }

  get d(): number {
    return this._d;
  }

  set d(value: number) {
    this._d = value;
  }

  get f(): number {
    return this._f;
  }

  set f(value: number) {
    this._f = value;
  }

  get iZone(): number {
    return this._iZone;
  }

  set iZone(value: number) {
    this._iZone = value;
  }

  get dFilter(): number {
    return this._dFilter;
  }

  set dFilter(value: number) {
    this._dFilter = value;
  }

  get minOutput(): number {
    return this._minOutput;
  }

  set minOutput(value: number) {
    this._minOutput = value;
  }

  get maxOutput(): number {
    return this._maxOutput;
  }

  set maxOutput(value: number) {
    this._maxOutput = value;
  }
}