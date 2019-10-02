import {constant, findIndex, isFunction, omit} from "lodash";

/**
 * Immutable setter of object field.
 */
export function setField<T, K extends keyof T>(entity: T, field: K, value: T[K]): T {
  if (entity[field] === value) {
    return entity;
  } else {
    return {...entity, [field]: value };
  }
}

/**
 * Immutable setter of object fields.
 */
export function setFields<T>(entity: T, values: Partial<{[P in keyof T]: T[P]}>): T {
  return Object.keys(values).reduce((lastEntity, key) => setField(lastEntity, key as keyof T, values[key]), entity);
}

/**
 * Returns provided object without specified field.
 */
export function removeField<T extends object, P extends keyof T>(entity: T, key: P): Omit<T, P> {
  if (entity.hasOwnProperty(key)) {
    return omit(entity, key);
  } else {
    return entity;
  }
}

/**
 * Returns provided object without specified fields.
 */
export function removeFields<T extends object, P extends keyof T>(entity: T, keys: P[]): Omit<T, P> {
  return keys.reduce((lastEntity, key) => removeField(lastEntity, key), entity);
}

/**
 * Applies function to the provided object iff object is not nil.
 */
export function maybeMap<T, R>(entity: T | undefined | null, map: (entity: T) => R): R | undefined | null {
  if (entity == null) {
    return entity as any;
  }
  return map(entity);
}

/**
 * Immutable transform array element by the given index.
 */
export function setArrayElement<T>(array: T[], index: number, value: T | ((value: T) => T)): T[] {
  const oldValue = array[index];

  const valueFn = isFunction(value) ? value : constant(value);
  const newValue = valueFn(oldValue);

  if (oldValue === newValue) {
    return array;
  }

  return array.slice(0, index).concat([newValue]).concat(array.slice(index + 1));
}

export function setArrayElementBy<T, K>(array: T[], toKey: (value: T) => K, key: K, value: T | ((value: T) => T)): T[] {
  const index = findIndex(array, (item) => toKey(item) === key);
  return setArrayElement(array, index, value);
}

export function setArrayElementWith<T>(array: T[],
                                       predicate: (value: T) => boolean,
                                       value: T | ((value: T) => T)): T[] {
  const index = findIndex(array, predicate);
  return setArrayElement(array, index, value);
}
