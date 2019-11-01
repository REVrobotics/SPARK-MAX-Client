import {cloneDeep} from "lodash";
import {IResource} from "./SparkmaxContext";

export abstract class AbstractResource implements IResource {
  private attributes: {[name: string]: any} = {};
  private destroyed: boolean;

  constructor(public device: string,
              attributes: {[name: string]: any} = {}) {
    this.attributes = cloneDeep(attributes);
  }

  public getAttributes(): {[name: string]: any} {
    return this.attributes;
  }

  public setAttribute(name: string, value: any): void {
    this.attributes.set(name, value);
  }

  public getAttribute(name: string): void {
    return this.attributes.get(name);
  }

  public destroy(): Promise<void> {
    this.destroyed = true;
    return this.stop();
  }

  public start(): void {
    this.checkAlive();

    this._start();
  }

  public stop(): Promise<void> {
    return this._stop();
  }

  public pause(): Promise<void>|undefined {
    this.checkAlive();

    return this.stop();
  }

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

  protected abstract _start(): void;
  protected abstract _stop(): Promise<void>;

  private checkAlive(): void {
    if (this.destroyed) {
      throw new Error("Cannot use destroyed resource");
    }
  }
}
