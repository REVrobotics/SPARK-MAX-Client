export default class MotorConfiguration {
  private readonly motorID: number;
  private readonly motorName: string;
  private readonly motorType: number;

  constructor(motorID: number, motorName: string, motorType: number) {
    this.motorID = motorID;
    this.motorName = motorName;
    this.motorType = motorType;
  }

  get id(): number {
    return this.motorID;
  }

  get name(): string {
    return this.motorName;
  }

  get type(): number {
    return this.motorType;
  }

}

export const REV_BRUSHLESS = new MotorConfiguration(1, "REV Brushless", 1);
export const CIM = new MotorConfiguration(2, "CIM", 0);
export const MINI_CIM = new MotorConfiguration(3, "Mini Cim", 0);
export const PRO = new MotorConfiguration(4, "775 Pro/Redline", 0);
export const BAG = new MotorConfiguration(5, "Bag", 0);
export const REV_HD_HEX = new MotorConfiguration(6, "REV HD Hex", 0);