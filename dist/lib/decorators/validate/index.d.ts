import { EnttValidationError, _primitiveTypeName } from './internals';
export { EnttValidationError };
/**
 * @Validate() decorator, configures property validation behavior
 * @param type Type to validate against
 * @param provider Validation provider, supports:
 * - Custom validation function of following shape: (value, obj) => Error[] | Error | string | boolean
 * - joi:         https://www.npmjs.com/package/joi
 * - joi-browser: https://www.npmjs.com/package/joi-browser
 * - yup:         https://www.npmjs.com/package/yup
 */
export declare function Validate({ type, provider, }?: {
    type?: _primitiveTypeName;
    provider?: any;
}): (target: any, key: any) => void;
