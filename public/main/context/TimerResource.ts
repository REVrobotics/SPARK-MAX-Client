import {IResource} from "./SparkmaxContext";

export class TimerResource implements IResource {
  private intervalId: any;
  private currentProcessing?: Promise<void>;
  private destroyed: boolean = false;

  constructor(private device: string,
              private processor: (device: string) => Promise<void>,
              private ms: number) {
    this.start();
  }

  public destroy(): Promise<void> {
    this.destroyed = true;
    return this.stop();
  }

  public pause(): Promise<void>|undefined {
    this.checkAlive();

    return this.stop();
  }

  public resume(): void {
    this.checkAlive();

    this.start();
  }

  public setOwner(device: string): void {
    this.checkAlive();

    this.device = device;
  }

  private start(): void {
    this.checkAlive();

    this.intervalId = setInterval(() => {
      this.currentProcessing = this.processor(this.device)
        .finally(() => {
          this.currentProcessing = undefined;
        });
    }, this.ms);
  }

  private stop(): Promise<void> {
    clearInterval(this.intervalId);
    return this.currentProcessing || Promise.resolve();
  }

  private checkAlive(): void {
    if (this.destroyed) {
      throw new Error("Cannot use destroyed resource");
    }
  }
}

export const timerResourceFactory = (processor: (device: string) => Promise<void>, ms: number) =>
  (device: string) => new TimerResource(device, processor, ms);
