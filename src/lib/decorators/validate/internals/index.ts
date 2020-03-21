// enTT lib @Validate decorator's internals
// ----------------------------------------------------------------------------

// Import dependencies
import { _undefined, _getClassMetadata, _getInstanceMetadata } from '../../../entt/internals';

// Define a unique symbol for Serializable decorator
export const _symbolValidate = Symbol('@Validate');

// Define supported types
export type _primitiveTypeName = 'boolean' | 'string' | 'number' | 'object';

/**
 * Initializes and returns validity store for the instance
 * @param target EnTT class instance containing the validity data
 * @returns Instance's validity store
 */
export function _readValidityMetadata (target) {
  const metadata =  _getInstanceMetadata(target);
  return metadata.validity || (metadata.validity = {
    valid: true,
    errors: {}
  });
}

/**
 * Validates all properties of object instance
 * @param target Object instance to validate all properties of
 * @returns Hashmap of all properties having validation errors
 */
export function _validateObject (target): Record<string, Error[]> {
  // Validate all properties
  const keys = Object.keys(_getClassMetadata(target.constructor)?.decorators?.[_symbolValidate] || {});
  return keys.reduce((errors, key) => {
    const propertyErrors = _validateProperty(target, key);
    if (propertyErrors && propertyErrors.length) {
      errors[key] = propertyErrors;
    }
    return errors;
  }, {});
}

/**
 * Validates a property of target object instance
 * @param target Object instance to validate a property of
 * @param key Key of the property being validated
 * @param value (Optional) Property value being validated; if not present, current property value will be validated instead
 * @returns Array of validation errors
 */
export function _validateProperty (target, key, value = _undefined as any): Error[] {

  // Get property metadata
  const metadata = _getClassMetadata(target.constructor)?.decorators?.[_symbolValidate]?.[key];
  if (!metadata) { return []; }

  // Get instance validity and reset errors
  const validity  = _readValidityMetadata(target),
        errors    = (validity.errors[key] = []);

  // Check if value passed, or should be assumed from property (Using _undefined Symbol to allow undefined as a legitimate value being set)
  if (value === _undefined) {
    value = target[key];
  }

  // Validate by type, if available
  if (metadata.type) {
    if (typeof value !== metadata.type) {
      errors.push(new Error(`Value ${JSON.stringify(value)} is not of required type "${metadata.type}"!`));
    }
  }

  // Validate using valifation provider, if available
  if (typeof metadata.provider === 'function') {
    
    // Validate using custom validation function
    const err = metadata.provider(target, value);
    if (err !== undefined && err !== null && err !== true) {      
      if (err === false) {
        // Generic error
        errors.push(new Error(`Value ${JSON.stringify(value)} not allowed!`));
      } else if (typeof err === 'string') {
        // Create error from string
        errors.push(new Error(err));
      } else if (err instanceof Error) {
        // Take error
        errors.push(err);
      } else if (err instanceof Array) {
        // Take errors
        err.forEach((err) => {
          if (typeof err === 'string') {
            // Create error from string
            errors.push(new Error(err));
          } else if (err instanceof Error) {
            // Take error
            errors.push(err);
          }
        });
      }
    }

  } else if ((typeof metadata.provider === 'object') && (typeof metadata.provider.validate === 'function') && metadata.provider.__isYupSchema__) {

    // Validate using YUP validation
    try {
      metadata.provider.validateSync(value, { context: target });
    } catch (err) {
      err.errors.forEach((err) => {
        const msg = (err.substr(0, 5) === 'this ' ? `Value ${JSON.stringify(value)} ${err.substr(5)}` : err);
        errors.push(new Error(msg));
      });
    }

  } else if ((typeof metadata.provider === 'object') && (typeof metadata.provider.validate === 'function')) {

    // Validate using attached .validate() method
    const err = metadata.provider.validate(value, { context: target }).error;
    if (err && err.isJoi) {

      // Process JOI errors result
      err.details.forEach((err) => {
        const msg = err.message.replace(/"value"/g, `Value ${JSON.stringify(value)}`);
        errors.push(new Error(msg));
      });

    } else if (err instanceof Error) {

      // Process explicit errors
      errors.push(err);

    }

  }

  // Update target valid status
  validity.valid = !Object.values(validity.errors)
    .filter((errs: any[]) => !!errs.length).length;

  // Output validation result
  return errors;

}

/**
 * Returns validation status of the instance
 * @param target target instance being validated
 * @returns If instance is validated
 */
export function _isValid (target): boolean {
  // using @Validate

  // Return if local invalid
  const valid = _readValidityMetadata(target).valid as boolean;
  if (!valid) { return false; }

  // Return if any of children invalid
  for (const c  of _getInstanceMetadata(target).children) {
    if (!c.child.valid) { return false; }
  }

  // Return valid by default
  return true;

}

/**
 * Returns validation errors of all properties
 * @param target target instance being validated
 * @returns A hashmap of arrays of errors per property
 */
export function _getValidationErrors (target): Record<string, Error[]> {
  // using @Validate  // TODO: Track every child's path

  // Initialize all errors
  const allErrors = {};

  // Read local errors
  const errors = _readValidityMetadata(target).errors;
  Object.keys(errors)
    .forEach((key) => {
      // Add local errors per each property
      if (errors[key].length) {
        if (!allErrors[key]) { allErrors[key] = []; }
        allErrors[key] = [...errors[key]];
      }
    });

  // Read children
  for (const c of _getInstanceMetadata(target).children) {
    // Add child errors per each property
    const childErrors = c.child.errors;
    Object.keys(childErrors)
      .forEach((childKey) => {
        if (childErrors[childKey].length) {
          const compositeKey = `${c.path.join('.')}.${childKey}`;
          if (!allErrors[compositeKey]) { allErrors[compositeKey] = []; }
          allErrors[compositeKey].push(...childErrors[childKey]);
        }
      });
  }

  // Return all found errors
  return allErrors;

}
