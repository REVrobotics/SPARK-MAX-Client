export default class Sensor {
  private _name: string;
  private _id: number;

  constructor(name: string, id: number) {
    this._name = name;
    this._id = id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }
}

export const NO_SENSOR = new Sensor("No Sensor", 0);
export const HALL_SENSOR = new Sensor("Hall Effect", 1);
export const ENCODER = new Sensor("Encoder", 2);

export function getFromID(id: number): Sensor {
  switch (id) {
    case 0:
      return NO_SENSOR;
    case 1:
      return HALL_SENSOR;
    case 2:
      return ENCODER;
    default:
      return NO_SENSOR;
  }
}