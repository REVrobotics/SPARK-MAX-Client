import {noop, values} from "lodash";

export type ResourceFactory = (device: string) => IResource;

export interface IResource {
  setOwner?(device: string): void;

  pause(): Promise<void>|undefined;

  resume(): void;

  destroy(): Promise<void>|undefined;
}

/**
 * This class tracks connected device and associated resources.
 * It transparently manages associated resources: allocate and release them.
 */
export class SparkmaxContext {
  private device?: string;
  private permanentResources: IResource[] = [];
  private temporaryResources: {[name: string]: IResource} = {};
  private paused: boolean = false;
  private pausePromise: Promise<void>|undefined;

  /**
   * Creates server with provided resources.
   * Resources will be instantiated as soon as some device is connected.
   */
  constructor(private permanentResourceFactories: ResourceFactory[] = []) {
  }

  /**
   * Returns current device ID
   */
  get currentDevice(): string|undefined {
    return this.device;
  }

  /**
   * Connects given device
   */
  public connectDevice(device: string): Promise<void> {
    if (this.device === device) {
      return Promise.resolve();
    }

    // If device is changed, release old resources and allocate a new one
    return this.disconnectDevice().then(() => {
      this.device = device;
      this.permanentResources = this.permanentResourceFactories.map((factory) => factory(device));
    });
  }

  /**
   * Disconnects from current device
   */
  public disconnectDevice(): Promise<void> {
    if (this.device == null) {
      return Promise.resolve();
    }

    // Release old resources
    const promise = Promise.all(this.getAllResources().map((resource) => resource.destroy()).filter(Boolean))
      .then(noop);

    this.device = undefined;
    this.permanentResources.length = 0;
    this.temporaryResources = {};
    this.paused = false;
    this.pausePromise = undefined;

    return promise;
  }

  /**
   * Creates new temporary resource for connected device
   */
  public newDeviceResource(name: string, factory: ResourceFactory): void {
    if (this.temporaryResources[name]) {
      throw new Error(`Resource already started under name '${name}'`)
    }
    if (this.paused) {
      throw new Error("Cannot create new resources when server is paused");
    }

    if (this.device) {
      this.temporaryResources[name] = factory(this.device);
    }
  }

  /**
   * Release temporary resource by name
   */
  public releaseDeviceResource(name: string): Promise<void> {
    let promise: Promise<void>|undefined;

    const resource = this.temporaryResources[name];
    if (resource) {
      promise = resource.destroy();
      delete this.temporaryResources[name];
    }
    return promise || Promise.resolve();
  }

  /**
   * Returns true if temporary resource exists, otherwise false.
   */
  public isResourceExist(name: string): boolean {
    return this.temporaryResources[name] != null;
  }

  /**
   * Pauses all resources.
   *
   * This action is not immediate, because we can have some processing in progress.
   * This way, we wait until this processing is completed.
   */
  public pause(): Promise<void> {
    if (this.paused) {
      return this.pausePromise as Promise<void>;
    }

    this.paused = true;
    this.pausePromise = Promise.all(this.getAllResources().map((resource) => resource.pause()).filter(Boolean))
      .then(noop);

    return this.pausePromise;
  }

  /**
   * Resume resources after pause.
   */
  public resume(): void {
    if (!this.paused) {
      return;
    }

    this.getAllResources().forEach((resource) => resource.resume());
    this.paused = false;
    this.pausePromise = undefined;
  }

  /**
   * Changes device id. This operation pauses and resumes server
   * @param device
   */
  public changeDeviceId(device: string): Promise<void> {
    if (this.device === device) {
      return Promise.resolve();
    }

    if (!this.paused) {
      throw new Error("Device ID can be changed only when server is paused");
    }

    // wait until all resources complete current processing
    return this.pausePromise!.then(() => {
      // change owner of each resource (if it is supported)
      this.getAllResources().forEach((resource) => {
        if (resource.setOwner) {
          resource.setOwner(device);
        } else {
          throw new Error("One of device resources does not support changing of ownership");
        }
      });
    });
  }

  /**
   * Returns all current resources
   */
  private getAllResources(): IResource[] {
    return this.permanentResources.concat(values(this.temporaryResources));
  }
}
