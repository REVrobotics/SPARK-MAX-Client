import {DependencyList, Ref, useCallback, useEffect, useRef} from "react";

interface IRefEffectInfo<T> {
  value?: T;
  cleanup: (() => void) | undefined;
}

const cleanup = (info?: IRefEffectInfo<any>): void => {
  if (info && info.cleanup) {
    info.cleanup();
  }
};

/**
 * This hook allows to run effect for HTMLElement as soon as reference to this element is available.
 * Similar problem and solution described here:
 * https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
 *
 * Unlike solution in article, useRefEffect allows to recalculate effect
 * as soon as there is a change in dependency list.
 *
 * @param callback
 * @param deps
 */
export const useRefEffect = <T>(callback: (value: T) => void | (() => void),
                                deps: DependencyList): Ref<T> => {
  const ref = useRef<IRefEffectInfo<T> | undefined>(undefined);
  // We need effect to catch situation when only dependency list is changed
  useEffect(() => {
    cleanup(ref.current);
    if (ref.current && ref.current.value) {
      ref.current.cleanup = callback(ref.current.value) as any;
    }
  }, deps);

  return useCallback((value) => {
    cleanup(ref.current);
    if (value) {
      ref.current = {
        value,
        cleanup: callback(value) as any,
      };
    } else {
      ref.current = undefined;
    }
  }, []);
};
