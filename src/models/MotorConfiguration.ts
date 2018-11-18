export default class MotorConfiguration implements ISerializable {
  private _name: string;
  private _canID: number;
  private _type: number;

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

  get type(): number {
    return this._type;
  }

  set type(value: number) {
    this._type = value;
  }
}

export const REV_BRUSHLESS = new MotorConfiguration("REV Brushless",  1);
export const CIM = new MotorConfiguration("CIM", 0);
export const MINI_CIM = new MotorConfiguration("Mini Cim", 0);
export const PRO = new MotorConfiguration("775 Pro/Redline", 0);
export const BAG = new MotorConfiguration("Bag", 0);
export const REV_HD_HEX = new MotorConfiguration("REV HD Hex", 0);