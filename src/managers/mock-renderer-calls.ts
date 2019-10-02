// TODO: mock mode should run only in development environment
import {sortBy} from "lodash";
import {when} from "../utils/promise-utils";

const isMockMode = true;

type OneWayCall = (name: string, ...args: any[]) => void;
type TwoWayCall = (name: string, ...args: any[]) => Promise<any>;
type CallbackCall = (name: string, cb: (...args: any[]) => void) => () => void;

type OriginalCall = (name: string, ...args: any[]) => any;

interface IDecorationConfig {
  original: () => any;
  type: string;
  name: string;
  args: any[];
}

export interface IMockContext {
  name: string;
  original: () => any;
}

export function decorateOneWay(original: OneWayCall): OneWayCall {
  return decorateCall("one-way", original);
}

export function decorateTwoWay(original: TwoWayCall): TwoWayCall {
  return decorateCall("two-way", original);
}

export function decorateCallback(original: CallbackCall): CallbackCall {
  return decorateCall("callback", original);

}

function decorateCall(type: string,
                      original: OriginalCall): OriginalCall {
  if (isMockMode) {
    return (name: string, ...args: any[]) => {
      if (isMocked(type, name)) {
        return useMock({
          original: () => original(name, ...args),
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

const mockedCalls = {
  "one-way": {},
  "two-way": {},
  "callback": {}
};

const mockNotifiers = {};

function isMocked(type: string, name: string): boolean {
  return mockedCalls[type][name] != null;
}

function useMock(config: IDecorationConfig): any {
  return mockedCalls[config.type][config.name]({name: config.name, original: config.original}, ...config.args)
}

export function mockOneWayCall(name: string, cb: (ctx: IMockContext, ...args: any[]) => void): void {
  mockedCalls["one-way"][name] = cb;
}

export function mockTwoWayCall(name: string, cb: (ctx: IMockContext, ...args: any[]) => Promise<any>): void {
  // Guarantee that this method always returns Promise
  mockedCalls["two-way"][name] = (ctx: IMockContext, ...args: any[]) => when(cb(ctx, ...args));
}

export function mockCallbackCall(name: string,
                                 init: (ctx: IMockContext, cb: (...args: any[]) => void) => () => void): void {
  // tslint:disable-next-line:no-string-literal
  mockedCalls["callback"][name] = init;
}

export function mockNotify(name: string, ...args: any[]): void {
  if (mockNotifiers[name]) {
    mockNotifiers[name](...args)
  } else {
    console.error(`There is no mocks registered for '${name}'`);
  }
}

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

export const MOCK_AND_NATIVE_CALL = ({name, original}: IMockContext, cb: (...args: any[]) => void) => {
  const unsubscribe = original();
  mockNotifiers[name] = cb;

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
    delete mockNotifiers[name];
  }
};

export const ONLY_NATIVE_CALL = ({original}: IMockContext, cb: (...args: any[]) => void) => {
  const unsubscribe = original();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  }
};

export const ONLY_MOCK_CALL = ({name}: IMockContext, cb: (...args: any[]) => void) => {
  mockNotifiers[name] = cb;

  return () => {
    delete mockNotifiers[name];
  }
};
