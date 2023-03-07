// enTT shared utility functionality
// ----------------------------------------------------------------------------

// Import and (re)export logging functionality
import { log } from '../lib';

/**
 * Clones a source value, preventing any shared (nested) references between the source and returned values
 * @param source Value to clone
 * @returns Cloned value
 */
export function deepCloneObject<T extends any>(source: T): T {
  // Primitive types are returned as copies, so no cloning required
  if (!(source instanceof Object)) {
    return source;
  }
  // Non-primitive array types require cloning of each member to avoid shared references
  else if (source instanceof Array) {
    return source.map(m => deepCloneObject(m)) as T;
  }
  // Non-primitive object types require cloning of each property to avoid shared references
  else if (source instanceof Object) {
    return Object.keys(source).reduce((obj, key) => {
      obj[key] = deepCloneObject((source as any)[key]); // TODO: Clean this "as any" mess up!
      return obj;
    }, {} as Record<PropertyKey, any>) as T;
  }
  // This should never happen - impossible clone execution path!
  else {
    log(new Error(`Attempting to clone unupported type: ${source}`));
    return source;
  }
}
