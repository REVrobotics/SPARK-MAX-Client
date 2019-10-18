import {Middleware} from "redux";
import {when} from "../promise-utils";
import {isScheduledAction, ScheduleProcessor} from "./action";
import {Scheduler, taskToPromise} from "./scheduler";
import {asRun} from "./processors";

/**
 * Config defines processor for each selector
 */
export interface IScheduleConfig {
  [name: string]: ScheduleProcessor;
}

/**
 * Redux middleware. It is initialized by set of processors. Each processor is associated with some selector.
 */
export const reduxScheduler: (config: IScheduleConfig) => Middleware = (config) => (store) => {
  const schedule = new Scheduler();

  return (next) => (action) => {
    // For scheduled action we have to run scheduler logic
    if (isScheduledAction(action)) {
      // Try to find suitable processor
      const processor = config[action.selector] || asRun();
      if (processor) {
        // Create new task for this action
        const task = schedule.newTask(action.selector, action.parameters);

        // Run this task
        processor(schedule, task, () => {
          try {
            // On task completion, back control to scheduler
            return when(next(action.action)).then(
              (value) => schedule.resolve(task, value),
              (reason) => schedule.reject(task, reason));
          } catch (err) {
            schedule.reject(task, err);
            return Promise.reject(err);
          }
        });

        return taskToPromise(task);
      } else {
        return next(action.action);
      }
    }

    return next(action);
  };
};
