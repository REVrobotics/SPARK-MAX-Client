import {sortBy} from "lodash";
import {when} from "../utils/promise-utils";

const isMockMode = process.env.NODE_ENV === "development";

type OneWayCall = (name: string, ...args: any[]) => void;
type TwoWayCall = (name: string, ...args: any[]) => Promise<any>;
type CallbackCall = (name: string, cb: (...args: any[]) => void) => () => void;

type OriginalCall = (name: string, ...args: any[]) => any;

interface IDecorationConfig {
  original: (args?: any[]) => any;
  type: string;
  name: string;
  args: any[];
}

/**
 * Context of mocked call
 */
export interface IMockContext {
  /**
   * Name of call
   */
  name: string;
  /**
   * Fires original implementation of call
   */
  original: (args?: any[]) => any;
}

/**
 * Decorates one-way call by mock functionality
 */
export function decorateOneWay(original: OneWayCall): OneWayCall {
  return decorateCall("one-way", original);
}

/**
 * Decorates two-way call by mock functionality
 */
export function decorateTwoWay(original: TwoWayCall): TwoWayCall {
  return decorateCall("two-way", original);
}

/**
 * Decorates callback call by mock functionality
 */
export function decorateCallback(original: CallbackCall): CallbackCall {
  return decorateCall("callback", original);
}

export type DecoratedCallbackCall = (args: any[], next: (...args: any[]) => void) => void;

export function decorateCallbackCall(decorator: DecoratedCallbackCall): (ctx: IMockContext, cb: (...args: any[]) => void) => () => void {
  return ({name, original}, cb) => {
    return original(((...args: any[]) => {
      decorator(args, (modifiedArgs) => cb(...modifiedArgs))
    }) as any);
  };
}

/**
 * Creates mock decorator for any kind of call
 */
function decorateCall(type: string,
                      original: OriginalCall): OriginalCall {
  if (isMockMode) {
    return (name: string, ...args: any[]) => {
      // Decorator is created only if this call was mocked,
      // otherwise use original implementation
      if (isMocked(type, name)) {
        return useMock({
          original: (overriddenArgs) => original(name, ...(overriddenArgs || args)),
          type,
          name,
          args,
        });
      } else {
        return original(name, ...args);
      }
    };
  } else {
    return original;
  }
}

// Registry of mocked calls
const mockedCalls = {
  "one-way": {},
  "two-way": {},
  "callback": {}
};

// Set of registered callbacks for "callback" calls
const mockNotifiers = {};

/**
 * Returns true if given call was mocked by developer, otherwise false.
 */
function isMocked(type: string, name: string): boolean {
  return mockedCalls[type][name] != null;
}

/**
 * Calls mock implementation
 */
function useMock(config: IDecorationConfig): any {
  return mockedCalls[config.type][config.name]({name: config.name, original: config.original}, ...config.args)
}

/**
 * Mocks specified one-way call. The second argument specifies handler of this call.
 * ```ts
 * mockOneWayCall("some-one-way-call", (ctx, device, param) => {
 *   ctx.original(); // calls original call implementation
 *   console.log(device);
 * });
 * ```
 */
export function mockOneWayCall(name: string, cb: (ctx: IMockContext, ...args: any[]) => void): void {
  mockedCalls["one-way"][name] = cb;
}

/**
 * Mocks specified two-way call. The second argument specifies handler of this call.
 * ```ts
 * mockTwoWayCall("some-two-way-call", (ctx, device, param) => {
 *   ctx.original(); // calls original call implementation
 *   console.log(device);
 * });
 * ```
 */
export function mockTwoWayCall(name: string, cb: (ctx: IMockContext, ...args: any[]) => Promise<any>): void {
  // Guarantee that this method always returns Promise
  mockedCalls["two-way"][name] = (ctx: IMockContext, ...args: any[]) => when(cb(ctx, ...args));
}

/**
 * Mocks specified callback call. The second arguments assigns strategy on how to mock corresponding callback calls.
 * Mock callback calls can be emulated using one of mockNotify* functions.
 *
 * @param name
 * @param init assigns the strategy to mock this kind of call (one of {@link CB_MOCK_AND_NATIVE_CALL},
 * {@link CB_ONLY_MOCK_CALL}, {@link CB_ONLY_NATIVE_CALL}).
 */
export function mockCallbackCall(name: string,
                                 init: (ctx: IMockContext, cb: (...args: any[]) => void) => () => void): void {
  // tslint:disable-next-line:no-string-literal
  mockedCalls["callback"][name] = init;
}

/**
 * Emulates callback call and notifies all registered callbacks
 * (only if callback call was mocked using either {@link CB_MOCK_AND_NATIVE_CALL} or {@link CB_ONLY_MOCK_CALL})
 */
export function mockNotify(name: string, ...args: any[]): void {
  if (mockNotifiers[name]) {
    mockNotifiers[name](...args)
  } else {
    console.error(`There is no mocks registered for '${name}'`);
  }
}

/**
 * Emulates several callback calls and notifies all registered callbacks
 * (only if callback call was mocked using either {@link CB_MOCK_AND_NATIVE_CALL} or {@link CB_ONLY_MOCK_CALL}).
 *
 * This function fires callbacks for each key of the provided `scenario`.
 * Key should specify number of milliseconds starting from the begin of scenario.
 *
 * So, the following scenario
 * ```ts
 * mockCallbackCall("some-call", CB_ONLY_MOCK_CALL);
 * mockNotifyScenario("some-call", {
 *   1000: [1, 2, 3],
 *   2000: [4, 5, 6],
 * });
 * ```
 *
 * fires `some-call` callbacks two times:
 * * after `1000` milliseconds after the beginning
 * * after `2000` milliseconds after the beginning
 */
export function mockNotifyScenario(name: string, scenario: {[ms: number]: any[]}): void {
  const keys = sortBy(Object.keys(scenario).map(Number));
  const startTime = new Date();
  let currentKey = 0;

  const next = () => {
    if (currentKey === keys.length) {
      return;
    }

    const targetMs = keys[currentKey];

    const targetTime = new Date(startTime.getTime() + targetMs);

    setTimeout(() => {
      mockNotify(name, ...scenario[targetMs]);
      currentKey++;

      next();
    }, Math.max(0, targetTime.getTime() - new Date().getTime()));
  };

  next();
}

/**
 * Strategy for mocked callback calls: accepts mock and native calls
 */
export const CB_MOCK_AND_NATIVE_CALL = ({name, original}: IMockContext, cb: (...args: any[]) => void) => {
  const unsubscribe = original();
  mockNotifiers[name] = cb;

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
    delete mockNotifiers[name];
  }
};

/**
 * Strategy for mocked callback calls: accepts only native calls
 */
export const CB_ONLY_NATIVE_CALL = ({original}: IMockContext, cb: (...args: any[]) => void) => {
  const unsubscribe = original();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  }
};

/**
 * Strategy for mocked callback calls: accepts mocked calls
 */
export const CB_ONLY_MOCK_CALL = ({name}: IMockContext, cb: (...args: any[]) => void) => {
  mockNotifiers[name] = cb;

  return () => {
    delete mockNotifiers[name];
  }
};
