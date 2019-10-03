import {IResource} from "./SparkmaxContext";

/**
 * Resource used by {@link SparkmaxContext} based on interval.
 *
 * {@link TimerResource} periodically (`ms`) starts action (`processor`).
 */
export class TimerResource implements IResource {
  private intervalId: any;
  private currentProcessing?: Promise<void>;
  private destroyed: boolean = false;

  constructor(private device: string,
              private processor: (device: string) => Promise<void>,
              private ms: number) {
    this.start();
  }

  /**
   * Waits until current processing is completed and stops timer
   */
  public destroy(): Promise<void> {
    this.destroyed = true;
    return this.stop();
  }

  /**
   * Waits until current processing is completed and stops timer.
   * Processing can be resumed later.
   */
  public pause(): Promise<void>|undefined {
    this.checkAlive();

    return this.stop();
  }

  /**
   * Resumes processing.
   */
  public resume(): void {
    this.checkAlive();

    this.start();
  }

  /**
   * Changes target device
   */
  public setOwner(device: string): void {
    this.checkAlive();

    this.device = device;
  }

  /**
   * Starts timer
   */
  private start(): void {
    this.checkAlive();

    this.intervalId = setInterval(() => {
      this.currentProcessing = this.processor(this.device)
        .finally(() => {
          this.currentProcessing = undefined;
        });
    }, this.ms);
  }

  /**
   * Stops timer
   */
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
