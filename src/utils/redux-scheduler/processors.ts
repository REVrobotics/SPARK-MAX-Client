import {constant} from "lodash";
import {deferred} from "../promise-utils";
import {IScheduledTask, ScheduleProcessor} from "./action";

/**
 * Defines processor which runs task immediately
 */
export const asRun = constant<ScheduleProcessor>((schedule, task, next) => next());

/**
 * Defines processor which runs the latest task after some period of inactivity.
 */
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
        schedule.waitOnLock(task).then(() => {
          delete keyToTimeout[key];
          next();
        });
      }, ms),
      task,
    };
  };
};

/**
 * Guarantees that only one task satisfying given predicate is executed.
 * If some tasks satisfying predicate are already being executed, wait until they complete and start this task.
 */
export const asExclusive = (exclude: (test: IScheduledTask, current: IScheduledTask) => boolean): ScheduleProcessor => {
  return (schedule, task, next) => {
    const isPreviousTask = (test: IScheduledTask) => test.id < task.id && exclude(test, task);
    const isNextTask = (test: IScheduledTask) => test.id > task.id && exclude(test, task);
    // Block all new actions
    const unlock = schedule.lock(isNextTask);

    return schedule.waitOnLock(task)
    // Wait for all current actions
      .then(() => schedule.wait(isPreviousTask))
      .then(next)
      .finally(unlock);
  };
};

/**
 * Guarantees least possible number of commits for tasks.
 */
export const asLeastCommits = (toKey: (task: IScheduledTask) => string): ScheduleProcessor => {
  const keyToNextTask: {[key: string]: {nextTask?: IScheduledTask; next?: () => void}} = {};

  return (schedule, task, next) => {
    schedule.waitOnLock(task).then(() => {
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
    });
  };
};

/**
 * Creates processor which wraps several other processors.
 * This processor associates a predicate with each processor and run the first processor satisfying predicate.
 */
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

/**
 * Creates processor which call given processors in order.
 */
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
