
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