// enTT lib @Validate decorator
// Configures an EnTT property validation behavior
// ----------------------------------------------------------------------------

// Import and (re)export internals
import {
  EnttValidationError,
  _symbolValidate,
  _primitiveTypeName,
  _providerCustomFunctionType,
  _readValidityMetadata,
  _validateObject,
  _validateProperty,
  _isValid,
  _getValidationErrors,
} from './internals';
export { EnttValidationError };

// Import dependencies
import { _getDecoratorMetadata } from '../../entt/internals';

/**
 * @Validate() decorator, configures property validation behavior
 * @param type Type to validate against
 * @param provider Validation provider, supports:
 * - Custom validation function of following shape:
 * - (value, obj) => Error[] | Error | string | boolean
 * - joi:         https://www.npmjs.com/package/joi
 * - joi-browser: https://www.npmjs.com/package/joi-browser
 * - yup:         https://www.npmjs.com/package/yup
 * ... or array for whom each member is one of the above
 */
export function Validate({
  type = undefined as _primitiveTypeName,
  provider = undefined as (_providerCustomFunctionType | any)[] | _providerCustomFunctionType | any,
} = {}) {
  // Set defaults
  const defaults = {
    type: undefined as _primitiveTypeName,
    provider: undefined as (_providerCustomFunctionType | any)[] | _providerCustomFunctionType | any,
  };

  // Return decorator
  return (target, key) => {
    // Store decorator metadata (configured value, or else inherited value, or else default value)
    const metadata = _getDecoratorMetadata(target.constructor, _symbolValidate);
    metadata[key] = {
      key,
      type: type !== undefined ? type : metadata[key]?.type !== undefined ? metadata[key].type : defaults.type,
      provider: provider !== undefined ? provider : metadata[key]?.provider !== undefined ? metadata[key].provider : defaults.provider,
    };
  };
}
