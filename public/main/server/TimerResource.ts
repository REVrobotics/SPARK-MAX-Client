import {AbstractResource} from "./AbstractResource";

/**
 * Resource used by {@link SparkmaxContext} based on interval.
 *
 * {@link TimerResource} periodically (`ms`) starts action (`processor`).
 */
export class TimerResource extends AbstractResource {
  private intervalId: any;
  private currentProcessing?: Promise<void>;

  constructor(device: string,
              private processor: (this: TimerResource, device: string, attributes: {[name: string]: any}) => Promise<void>,
              private ms: number,
              attributes: {[name: string]: any} = {}) {
    super(device, attributes);
  }

  /**
   * Starts timer
   */
  protected _start(): void {
    this.intervalId = setInterval(() => {
      this.currentProcessing = this.processor(this.device, this.getAttributes())
        .finally(() => {
          this.currentProcessing = undefined;
        });
    }, this.ms);
  }

  /**
   * Stops timer
   */
  protected _stop(): Promise<void> {
    clearInterval(this.intervalId);
    return this.currentProcessing || Promise.resolve();
  }
}

export const timerResourceFactory = (processor: (device: string, attributes: {[name: string]: any}) => Promise<void>,
                                     ms: number,
                                     attributes: {[name: string]: any} = {}) =>
  (device: string) => new TimerResource(device, processor, ms, attributes);
