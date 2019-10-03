// tslint:disable:max-classes-per-file

import {noop, pull} from "lodash";
import {deferred, IDeferred} from "../promise-utils";
import {IScheduledTask, IScheduler, ScheduleSelector} from "./action";

interface IScheduleLock {
  deferred: IDeferred<any>;
  predicate: (task: IScheduledTask) => boolean;
}

/**
 * Implementation of {@link IScheduledTask} interface
 */
export class ScheduledTask implements IScheduledTask {
  // tslint:disable-next-line:array-type
  private successCallbacks: ((value: any) => void)[] = [];
  // tslint:disable-next-line:array-type
  private failCallbacks: ((reason: any) => void)[] = [];
  // tslint:disable-next-line:array-type
  private finallyCallbacks: ((cancelled: boolean) => void)[] = [];

  constructor(public id: number,
              public selector: ScheduleSelector,
              public parameters: any[]) {
  }

  public onSuccess(onResolve: (value: any) => void): void {
    this.successCallbacks.push(onResolve);
  }

  public onFail(onReject: (reason: any) => void): void {
    this.failCallbacks.push(onReject);
  }

  public onFulfilled(onComplete: (cancelled: boolean) => void): void {
    this.finallyCallbacks.push(onComplete);
  }

  public resolve(value: any): void {
    try {
      this.successCallbacks.forEach((cb) => cb(value));
      this.finallyCallbacks.forEach((cb) => cb(false));
    } finally {
      this.cleanCallbacks();
    }
  }

  public reject(reason: any): void {
    try {
      this.failCallbacks.forEach((cb) => cb(reason));
      this.finallyCallbacks.forEach((cb) => cb(false));
    } finally {
      this.cleanCallbacks();
    }
  }

  public cancel(): void {
    try {
      this.finallyCallbacks.forEach((cb) => cb(true));
    } finally {
      this.cleanCallbacks();
    }
  }

  private cleanCallbacks(): void {
    this.successCallbacks.length = 0;
    this.failCallbacks.length = 0;
    this.finallyCallbacks.length = 0;
  }
}

/**
 * Converts task to Promise.
 * Promise is fulfilled only when task is successed or failed, but not cancelled.
 */
export const taskToPromise = (task: IScheduledTask) => new Promise((resolve, reject) => {
  task.onSuccess(resolve);
  task.onFail(reject);
});

/**
 * Converts task to Promise.
 * Promise is resolved as soon as task is completed successfully, unsuccessfully or cancelled.
 */
export const taskToFinallyPromise = (task: IScheduledTask) => new Promise((resolve) => task.onFulfilled(resolve));

/**
 * Implementation of {@link IScheduler}.
 */
export class Scheduler implements IScheduler {
  private tasks: ScheduledTask[] = [];
  private locks: IScheduleLock[] = [];
  private taskId = 1;

  public newTask(selector: ScheduleSelector, parameters: any[]): ScheduledTask {
    const task = new ScheduledTask(this.taskId++, selector, parameters);
    this.tasks.push(task);
    return task;
  }

  public resolve(task: ScheduledTask, value: any): void {
    pull(this.tasks, task);
    task.resolve(value);
  }

  public reject(task: ScheduledTask, reason: any): void {
    pull(this.tasks, task);
    task.reject(reason);
  }

  public cancel(task: ScheduledTask): void {
    pull(this.tasks, task);
    task.cancel();
  }

  public query(predicate: (task: IScheduledTask) => boolean): IScheduledTask[] {
    return this.tasks.filter(predicate);
  }

  public lock(predicate: (task: IScheduledTask) => boolean): () => void {
    const lock = {predicate, deferred: deferred()};
    this.locks.push(lock);
    return () => {
      pull(this.locks, lock);
      lock.deferred.resolve(undefined);
    };
  }

  public waitOnLock(task: IScheduledTask): Promise<void> {
    const locks = this.locks.filter(({predicate}) => predicate(task));
    return locks.length ? Promise.all(locks.map((lock) => lock.deferred.promise)).then(noop) : Promise.resolve();
  }

  public wait(predicate: (task: IScheduledTask) => boolean): Promise<void> {
    const tasksToWaitFor = this.tasks.filter(predicate);
    return tasksToWaitFor.length ? Promise.all(tasksToWaitFor.map(taskToFinallyPromise)).then(noop) : Promise.resolve();
  }
}
