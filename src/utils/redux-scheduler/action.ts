import {initial, last} from "lodash";
import {IThenable} from "../promise-utils";

const SCHEDULED = Symbol("SCHEDULED");

export interface IScheduledAction {
  [SCHEDULED]: true;
  selector: ScheduleSelector;
  parameters: any[];
  action: any;
}

export function isScheduledAction(action: any): action is IScheduledAction {
  return !!action[SCHEDULED];
}

/**
 * Task represents scheduled action.
 */
export interface IScheduledTask {
  /**
   * Unique id of task
   */
  id: number;
  /**
   * Selector is defined by developer for each action.
   * Developer can define own plan of execution for any action based on its selector and parameters.
   * Selector is a first parameter of {@link #onSchedule} function.
   */
  selector: ScheduleSelector;
  /**
   * Parameters passed to {@link #onSchedule} function.
   */
  parameters: any[];

  /**
   * Registers function called as soon as action is completed successfully
   */
  onSuccess(onResolve: (value: any) => void): void;

  /**
   * Registers function called as soon as action is completed unsuccessfully
   */
  onFail(onReject: (reason: any) => void): void;

  /**
   * Registers function called as soon as action is completed successfully, unsuccessfully or cancelled.=
   */
  onFulfilled(onComplete: (cancelled: boolean) => void): void;
}

/**
 * This interface defines operations to manage scheduling.
 */
export interface IScheduler {
  /**
   * Returns all tasks satisfying given predicate
   */
  query(predicate: (task: IScheduledTask) => boolean): IScheduledTask[];

  /**
   * Creates lock which will lock all tasks satisfying given predicate.
   * Returns function that release lock.
   */
  lock(predicate: (task: IScheduledTask) => boolean): () => void;

  /**
   * Wait until all tasks satisfying given predicate will be fulfilled.
   */
  wait(predicate: (task: IScheduledTask) => boolean): Promise<void>;

  /**
   * If the given task satisfies some lock, returned Promise will be resolved as soon as lock is released.
   * Otherwise returns resolved Promise.
   */
  waitOnLock(task: IScheduledTask): Promise<void>;

  /**
   * Cancels given task.
   */
  cancel(task: IScheduledTask): void;
}

export type ScheduleSelector = string;
/**
 * Processor defines behavior the task will follow to.
 * Processor is defined per-selector.
 */
export type ScheduleProcessor = (schedule: IScheduler, task: IScheduledTask, next: () => IThenable) => void;

/**
 * Creates {@link IScheduledAction} for specified action.
 * This method associates selector and, optionally, parameters with provided action.
 */
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
