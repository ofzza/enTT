// enTT lib @Validate decorator's internals
// ----------------------------------------------------------------------------

// Import dependencies
import { _undefined, TNew } from '../../../entt/internals';
import { _EnTTRoot, _getDecoratorMetadata, _getInstanceMetadata } from '../../../entt/internals';

// Define a unique symbol for Serializable decorator
export const _symbolValidate = Symbol('@Validate');

// Define supported types
export type _primitiveTypeName = 'boolean' | 'string' | 'number' | 'object';

/**
 * Validation enabled status
 */
let _validationEnabled = 0;
export function _validationEnable() {
  _validationEnabled--;
}
export function _validationDisable() {
  _validationEnabled++;
}

/**
 * Richer error class used for describing validation errors
 */
export class EnttValidationError extends Error {
  /**
   * Unique key enumerating the type of validation error
   */
  public type: string;

  /**
   * Context of the error message, containing values involved in validation
   */
  public context: any;

  /**
   * Creates an instance of JoiError.
   * @param type Unique key enumerating the type of validation error
   * @param message User friendly, verbose error message
   * @param context Context of the error message, containing values involved in validation
   */
  constructor({ type = null as string, message = null as string, context = {} as any } = {}) {
    super(message);

    // Set properties
    this.type = type;
    this.context = context;
  }
}

/**
 * Initializes and returns validity store for the instance
 * @param target EnTT class instance containing the validity data
 * @returns Instance's validity store
 */
export function _readValidityMetadata<T>(
  target: T,
): {
  valid: boolean;
  errors: Record<string, EnttValidationError[]>;
} {
  const metadata = _getInstanceMetadata(target);
  return (
    metadata.custom.validity ||
    (metadata.custom.validity = {
      valid: true,
      errors: {} as Record<string, EnttValidationError[]>,
    })
  );
}

/**
 * Validates all properties of object instance
 * @param target Object instance to validate all properties of
 * @returns Hashmap of all properties having validation errors
 */
export function _validateObject<T>(target: T): Record<string, EnttValidationError[]> {
  // Check if validation disabled
  if (_validationEnabled !== 0) {
    return {} as Record<string, EnttValidationError[]>;
  }
  // Validate all properties
  const keys = Object.keys(_getDecoratorMetadata(target.constructor, _symbolValidate) || {});
  return keys.reduce((errors, key) => {
    const propertyErrors = _validateProperty(target, key);
    if (propertyErrors && propertyErrors.length) {
      errors[key] = propertyErrors;
    } else {
      delete errors[key];
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
export function _validateProperty<T>(target: T, key, value = _undefined as any): EnttValidationError[] {
  // Check if validation disabled
  if (_validationEnabled !== 0) {
    return [] as EnttValidationError[];
  }
  // Get property metadata
  const metadata = _getDecoratorMetadata(target.constructor, _symbolValidate)[key];
  if (!metadata) {
    return [];
  }

  // Get instance validity and reset errors
  const validity = _readValidityMetadata(target),
    errors = (validity.errors[key] = []);

  // Check if value passed, or should be assumed from property (Using _undefined Symbol to allow undefined as a legitimate value being set)
  if (value === _undefined) {
    value = target[key];
  }

  // Validate by type, if available
  if (metadata.type) {
    if (typeof value !== metadata.type) {
      errors.push(new EnttValidationError({ message: `Value ${JSON.stringify(value)} is not of required type "${metadata.type}"!` }));
    }
  }

  // Validate using validation provider, if available
  if (typeof metadata.provider === 'function') {
    // Validate using custom validation function
    const err = metadata.provider(target, value);
    if (err !== undefined && err !== null && err !== true) {
      if (err === false) {
        // Generic error
        errors.push(new EnttValidationError({ message: `Value ${JSON.stringify(value)} not allowed!` }));
      } else if (typeof err === 'string') {
        // Create error from string
        errors.push(new EnttValidationError({ message: err }));
      } else if (err instanceof Error) {
        // Take error
        errors.push(err);
      } else if (err instanceof Array) {
        // Take errors
        err.forEach(err => {
          if (typeof err === 'string') {
            // Create error from string
            errors.push(new EnttValidationError({ message: err }));
          } else if (err instanceof Error) {
            // Take error
            errors.push(err);
          }
        });
      }
    }
  } else if (typeof metadata.provider === 'object' && typeof metadata.provider.validate === 'function' && metadata.provider.__isYupSchema__) {
    // Validate using YUP validation
    try {
      metadata.provider.validateSync(value, { context: target });
    } catch (err) {
      err.errors.forEach(msg => {
        msg = msg.substr(0, 5) === 'this ' ? `Value ${JSON.stringify(value)} ${msg.substr(5)}` : msg;
        errors.push(new EnttValidationError({ type: err.type, message: msg, context: err.context }));
      });
    }
  } else if (typeof metadata.provider === 'object' && typeof metadata.provider.validate === 'function') {
    // Validate using attached .validate() method
    const err = metadata.provider.validate(value, { context: target }).error;
    if (err && err.isJoi) {
      // Process JOI errors result
      err.details.forEach(err => {
        const msg = err.message.replace(/"value"/g, `Value ${JSON.stringify(value)}`);
        errors.push(new EnttValidationError({ type: err.type, message: msg, context: err.context }));
      });
    } else if (err instanceof Error) {
      // Process explicit errors
      errors.push(err);
    }
  }

  // Update target valid status
  validity.valid = !Object.values(validity.errors).filter((errs: any[]) => !!errs.length).length;

  // Output validation result
  return errors;
}

/**
 * Returns validation status of the instance
 * @param target target instance being validated
 * @returns If instance is validated
 */
export function _isValid<T>(target: T): boolean {
  // using @Validate

  // Return if local invalid
  const valid = _readValidityMetadata(target).valid as boolean;
  if (!valid) {
    return false;
  }

  // Return if any of children invalid
  for (const c of _getInstanceMetadata(target).children) {
    if (!c.child.valid) {
      return false;
    }
  }

  // Return valid by default
  return true;
}

/**
 * Returns validation errors of all properties
 * @param target target instance being validated
 * @returns A hashmap of arrays of errors per property
 */
export function _getValidationErrors<T>(target: T): Record<string, EnttValidationError[]> {
  // using @Validate

  // Initialize all errors
  const allErrors = {};

  // Read local errors
  const errors = _readValidityMetadata(target).errors;
  Object.keys(errors).forEach(key => {
    // Add local errors per each property
    if (errors[key].length) {
      if (!allErrors[key]) {
        allErrors[key] = [];
      }
      allErrors[key] = [...errors[key]];
    }
  });

  // Read children
  for (const c of _getInstanceMetadata(target).children) {
    // Add child errors per each property
    const childErrors = c.child.errors;
    Object.keys(childErrors).forEach(childKey => {
      if (childErrors[childKey].length) {
        const compositeKey = `${c.path.join('.')}.${childKey}`;
        if (!allErrors[compositeKey]) {
          allErrors[compositeKey] = [];
        }
        allErrors[compositeKey].push(...childErrors[childKey]);
      }
    });
  }

  // Return all found errors
  return allErrors;
}
