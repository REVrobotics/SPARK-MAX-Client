import {noop, values} from "lodash";

export type ResourceFactory = (device: string) => IResource;

export interface IResource {
  setOwner?(device: string): void;

  pause(): Promise<void>|undefined;

  resume(): void;

  destroy(): Promise<void>|undefined;
}

export class SparkmaxContext {
  private device?: string;
  private permanentResources: IResource[] = [];
  private temporaryResources: {[name: string]: IResource} = {};
  private paused: boolean = false;
  private pausePromise: Promise<void>|undefined;

  constructor(private permanentResourceFactories: ResourceFactory[] = []) {
  }

  get currentDevice(): string|undefined {
    return this.device;
  }

  public connectHubDevice(device: string): Promise<void> {
    if (this.device === device) {
      return Promise.resolve();
    }

    return this.disconnectHubDevice().then(() => {
      this.device = device;
      this.permanentResources = this.permanentResourceFactories.map((factory) => factory(device));
    });
  }

  public disconnectHubDevice(): Promise<void> {
    if (this.device == null) {
      return Promise.resolve();
    }

    const promise = Promise.all(this.getAllResources().map((resource) => resource.destroy()).filter(Boolean))
      .then(noop);

    this.device = undefined;
    this.permanentResources.length = 0;
    this.temporaryResources = {};
    this.paused = false;
    this.pausePromise = undefined;

    return promise;
  }

  public newDeviceResource(name: string, factory: ResourceFactory): void {
    if (this.temporaryResources[name]) {
      throw new Error(`Resource already started under name '${name}'`)
    }
    if (this.paused) {
      throw new Error("Cannot create new resources when context is paused");
    }

    if (this.device) {
      this.temporaryResources[name] = factory(this.device);
    }
  }

  public releaseDeviceResource(name: string): Promise<void> {
    let promise: Promise<void>|undefined;

    const resource = this.temporaryResources[name];
    if (resource) {
      promise = resource.destroy();
      delete this.temporaryResources[name];
    }
    return promise || Promise.resolve();
  }

  public isResourceExist(name: string): boolean {
    return this.temporaryResources[name] != null;
  }

  public pause(): Promise<void> {
    if (this.paused) {
      return this.pausePromise as Promise<void>;
    }

    this.paused = true;
    this.pausePromise = Promise.all(this.getAllResources().map((resource) => resource.pause()).filter(Boolean))
      .then(noop);

    return this.pausePromise;
  }

  public resume(): void {
    if (!this.paused) {
      return;
    }

    this.getAllResources().forEach((resource) => resource.resume());
    this.paused = false;
    this.pausePromise = undefined;
  }

  public changeDeviceId(device: string): Promise<void> {
    if (this.device === device) {
      return Promise.resolve();
    }

    // wait until all resources complete current processing
    return this.pause().then(() => {
      // change owner of each resource (if it is supported)
      this.getAllResources().forEach((resource) => {
        if (resource.setOwner) {
          resource.setOwner(device);
        } else {
          throw new Error("One of device resources does not support changing of ownership");
        }
      });
      this.resume();
    });
  }

  private getAllResources(): IResource[] {
    return this.permanentResources.concat(values(this.temporaryResources));
  }
}
