import {constant, isFunction} from "lodash";

export function setField<T, K extends keyof T>(entity: T, field: K, value: T[K]): T {
  if (entity[field] === value) {
    return entity;
  } else {
    return {...entity, [field]: value };
  }
}

export function setFields<T>(entity: T, values: Partial<{[P in keyof T]: T[P]}>): T {
  return Object.keys(values).reduce((lastEntity, key) => setField(lastEntity, key as keyof T, values[key]), entity);
}

export function maybeMap<T, R>(entity: T | undefined | null, map: (entity: T) => R): R | undefined | null {
  if (entity == null) {
    return entity as any;
  }
  return map(entity);
}

export function setArrayElement<T>(array: T[], index: number, value: T | ((value: T) => T)): T[] {
  const oldValue = array[index];

  const valueFn = isFunction(value) ? value : constant(value);
  const newValue = valueFn(oldValue);

  if (oldValue === newValue) {
    return array;
  }

  return array.slice(0, index).concat([newValue]).concat(array.slice(index + 1));
}
