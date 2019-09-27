// tslint:disable:max-classes-per-file

import {constant, initial, last, noop, pull} from "lodash";
import {Middleware} from "redux";
import {deferred, IDeferred, IThenable, when} from "./promise-utils";

const SCHEDULED = Symbol("SCHEDULED");

interface IScheduledAction {
  [SCHEDULED]: true;
  selector: ScheduleSelector;
  parameters: any[];
  action: any;
}

function isScheduledAction(action: any): action is IScheduledAction {
  return !!action[SCHEDULED];
}

export interface IScheduledTask {
  id: number;
  selector: ScheduleSelector;
  parameters: any[];

  onSuccess(onResolve: (value: any) => void): void;

  onFail(onReject: (reason: any) => void): void;

  onFulfilled(onComplete: (cancelled: boolean) => void): void;
}

export interface ISchedule {
  query(predicate: (task: IScheduledTask) => boolean): IScheduledTask[];

  lock(predicate: (task: IScheduledTask) => boolean): () => void;

  wait(predicate: (task: IScheduledTask) => boolean): Promise<void>;

  cancel(task: IScheduledTask): void;
}

export type ScheduleSelector = string;
export type ScheduleProcessor = (schedule: ISchedule, task: IScheduledTask, next: () => IThenable) => void;

export interface IScheduleConfig {
  [name: string]: ScheduleProcessor
}

interface IScheduleLock {
  deferred: IDeferred<any>;
  predicate: (task: IScheduledTask) => boolean;
}

class ScheduledTask implements IScheduledTask {
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

export const taskToPromise = (task: IScheduledTask) => new Promise((resolve, reject) => {
  task.onSuccess(resolve);
  task.onFail(reject);
});

export const taskToFinallyPromise = (task: IScheduledTask) => new Promise((resolve) => task.onFulfilled(resolve));

class Schedule implements ISchedule {
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

export const asRun = constant<ScheduleProcessor>((schedule, task, next) => next());

export const asDebounce = (toKey: (task: IScheduledTask) => string,
                           ms: number = 300): ScheduleProcessor => {
  const keyToTimeout: {[key: string]: {timeout: any, task: IScheduledTask}} = {};

  return (schedule, task, next) => {
    const key = toKey(task);

    const entry = keyToTimeout[key];
    if (entry != null) {
      schedule.cancel(entry.task);
      clearTimeout(entry.timeout);
    }
    keyToTimeout[key] = {
      timeout: setTimeout(() => {
        delete keyToTimeout[key];
        next();
      }, ms),
      task,
    };
  };
};

export const asExclusive = (exclude: (test: IScheduledTask, current: IScheduledTask) => boolean): ScheduleProcessor => {
  return (schedule, task, next) => {
    const isPreviousTask = (test: IScheduledTask) => test.id < task.id && exclude(test, task);
    const isNextTask = (test: IScheduledTask) => test.id > task.id && exclude(test, task);
    // Block all new actions
    const unlock = schedule.lock(isNextTask);

    // Wait for all current actions
    schedule.wait(isPreviousTask)
      .then(next)
      .finally(unlock);
  };
};

export const asLeastCommits = (toKey: (task: IScheduledTask) => string): ScheduleProcessor => {
  const keyToNextTask: {[key: string]: {nextTask?: IScheduledTask; next?: () => void}} = {};

  return (schedule, task, next) => {
    const key = toKey(task);
    let entry = keyToNextTask[key];

    // If entry exists, then some task is running
    if (entry) {
      // Cancel old "next task"
      if (entry.nextTask) {
        schedule.cancel(entry.nextTask);
      }

      // Set current task as the next one
      entry.nextTask = task;
      entry.next = next;
    } else {
      // Create entry to indicate that some task is running
      keyToNextTask[key] = entry = {};

      const onRunNextTask = () => {
        if (entry.next && entry.nextTask) {
          entry.nextTask.onFulfilled(onRunNextTask);
          entry.next();
          entry.next = undefined;
          entry.nextTask = undefined;
        } else {
          delete keyToNextTask[key];
        }
      };

      task.onFulfilled(onRunNextTask);

      next();
    }
  };
};

// tslint:disable-next-line:array-type
export const asCond = (...processors: [(task: IScheduledTask) => boolean, ScheduleProcessor][]): ScheduleProcessor => {
  return (schedule, task, next) => {
    const pair = processors.find(([predicate]) => predicate(task));
    if (pair == null) {
      next();
    } else {
      pair[1](schedule, task, next);
    }
  };
};

export const asComposed = (...processors: ScheduleProcessor[]): ScheduleProcessor => {
  return (schedule, task, next) => {
    let i = 0;

    const dfd = deferred();

    const nextIteration = () => {
      if (i === processors.length) {
        return next().then((value) => dfd.resolve(value), (reason) => dfd.reject(reason));
      } else {
        processors[i++](schedule, task, nextIteration);
        return dfd.promise;
      }
    };

    nextIteration();
  };
};

export const reduxScheduler: (config: IScheduleConfig) => Middleware = (config) => (store) => {
  const schedule = new Schedule();

  return (next) => (action) => {
    // For schedule action we have to run scheduler logic
    if (isScheduledAction(action)) {
      // Try to find suitable processor
      const processor = config[action.selector] || asRun();
      if (processor) {
        // Create new task for this action
        const task = schedule.newTask(action.selector, action.parameters);

        // Guarantee that other tasks do not lock this one task
        return schedule.waitOnLock(task).then(() => {
          // Run this task
          processor(schedule, task, () => {
            try {
              // On task completion, back control to scheduler
              return when(next(action.action)).then(
                (value) => schedule.resolve(task, value),
                (reason) => schedule.reject(task, reason));
            } catch (err) {
              schedule.reject(task, err);
              return Promise.reject();
            }
          });
          return taskToPromise(task);
        }).catch((err) => {
          console.error(err);
          return Promise.reject(err);
        });
      } else {
        return next(action.action);
      }
    }

    return next(action);
  };
};

export function onSchedule<TAction>(selector: ScheduleSelector, action: TAction): TAction;
export function onSchedule<TArg, TAction>(selector: ScheduleSelector, arg1: TArg, action: TAction): TAction;
export function onSchedule<TArg1, TArg2, TAction>(selector: ScheduleSelector, arg1: TArg1, arg2: TArg2, action: TAction): TAction;
export function onSchedule(selector: ScheduleSelector, ...args: any[]) {
  const parameters = initial(args);
  const action = last(args);
  return {
    [SCHEDULED]: true,
    selector,
    parameters,
    action,
  };
}
