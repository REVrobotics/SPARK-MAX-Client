import {constant, difference, findIndex, intersection, isFunction, keyBy, omit} from "lodash";

/**
 * Immutable setter of object field.
 */
export function setField<T, K extends keyof T>(entity: T, field: K, value: T[K] | ((value: T[K]) => T[K])): T {
  const valueFn = isFunction(value) ? value : constant(value);
  const newValue = valueFn(entity[field]);

  if (entity[field] === newValue) {
    return entity;
  } else {
    return {...entity, [field]: newValue };
  }
}

/**
 * Immutable setter of object fields.
 */
export function setFields<T>(entity: T, values: Partial<{[P in keyof T]: T[P]}>): T {
  return Object.keys(values).reduce((lastEntity, key) => setField(lastEntity, key as keyof T, values[key]), entity);
}

export function setNestedField<T>(entity: T, path: any[], value: any): T {
  return setField(
    entity,
    path[0],
    path.length > 1 ? setNestedField(entity[path[0]], path.slice(1), value) : value);
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
 * Immutable transforms array element by the given index.
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

/**
 * Immutable transforms array element by the given key
 */
export function setArrayElementBy<T, K>(array: T[], toKey: (value: T) => K, key: K, value: T | ((value: T) => T)): T[] {
  const index = findIndex(array, (item) => toKey(item) === key);
  return setArrayElement(array, index, value);
}

/**
 * Immutable transform array element by predicate
 */
export function setArrayElementWith<T>(array: T[],
                                       predicate: (value: T) => boolean,
                                       value: T | ((value: T) => T)): T[] {
  const index = findIndex(array, predicate);
  return setArrayElement(array, index, value);
}

/**
 * Returns `value` if it is not `null` or `undefined`, otherwise returns `otherwise`.
 */
export function coalesce<T, O extends T>(value: T | null | undefined, otherwise: O): T {
  return value == null ? otherwise : value;
}

/**
 * Describes result of `diffObjects` operation
 */
interface IDiffResult<T> {
  added: T[];
  unmodified: T[];
  modified: Array<{previous: T, next: T}>;
  removed: T[];
}

/**
 * Analyzes two set of objects and returns detailed description of all changes
 */
export function diffObjects<T>(previous: T[], next: T[], by: (obj: T) => any): IDiffResult<T> {
  const previousIds = previous.map(by);
  const nextIds = next.map(by);

  const previousById = keyBy<T>(previous, by);
  const nextById = keyBy<T>(next, by);

  const addedIds = difference(nextIds, previousIds);
  const existingIds = intersection(nextIds, previousIds);
  const removedIds = difference(previousIds, nextIds);

  return {
    added: addedIds.map((id) => nextById[id]),
    modified: existingIds
      .filter((id) => previousById[id] !== nextById[id])
      .map((id) => ({previous: previousById[id], next: nextById[id]})),
    unmodified: existingIds.filter((id) => previousById[id] === nextById[id]).map((id) => previousById[id]),
    removed: removedIds.map((id) => previousById[id]),
  };
};
