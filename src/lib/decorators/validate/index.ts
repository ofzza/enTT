// enTT lib @Validate decorator
// Configures an EnTT property validation behavior
// ----------------------------------------------------------------------------

// Import and (re)export internals
import { _symbolValidate, _primitiveTypeName, _readValidityMetadata, _validateObject, _validateProperty, _isValid, _getValidationErrors } from './internals';
export { _symbolValidate, _primitiveTypeName, _readValidityMetadata, _validateObject, _validateProperty, _isValid, _getValidationErrors };

// Import dependencies
import { _getClassMetadata } from '../../entt/internals';

/**
 * @Validate() decorator, configures property validation behavior
 * @param type Type to validate against
 * @param provider Validation provider, supports:
 * - Custom validation function of following shape: (obj, value) => Error[] | Error | string | boolean
 * - @hapi/joi:   https://www.npmjs.com/package/@hapi/joi
 * - joi-browser: https://www.npmjs.com/package/joi-browser
 * - yup:         https://www.npmjs.com/package/yup
 */
export function Validate ({
  type      = undefined as _primitiveTypeName,
  provider  = undefined as any
} = {}) {

  // Return decorator
  return (target, key) => {
    // Store @Validate metadata
    const decorators  = _getClassMetadata(target.constructor).decorators,
          metadata    = decorators[_symbolValidate] || (decorators[_symbolValidate] = {});
    if (!metadata[key]) {
      metadata[key] = {
        type,
        provider
      };
    }
  }

}
