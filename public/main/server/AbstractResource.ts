import {cloneDeep} from "lodash";
import {IResource} from "./SparkmaxContext";

/**
 * Base class for all {@link IResource}s.
 * Implementation of this class should implement `_start` and `_stop` methods at least.
 */
export abstract class AbstractResource implements IResource {
  private attributes: {[name: string]: any} = {};
  private destroyed: boolean;

  /**
   * Whether this resource is pauseable.
   * If resource is pauseable, it is allowed to call pause/resume methods.
   */
  private pauseable: boolean = false;

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

  public pause(): Promise<void> {
    if (!this.pauseable) {
      throw new Error("This resource does not support pause");
    }

    this.checkAlive();

    return this.stop();
  }

  public resume(): void {
    if (!this.pauseable) {
      throw new Error("This resource does not support pause");
    }

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

  protected setPauseable(): void {
    this.pauseable = true;
  }

  private checkAlive(): void {
    if (this.destroyed) {
      throw new Error("Cannot use destroyed resource");
    }
  }
}
