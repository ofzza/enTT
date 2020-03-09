"use strict";
// enTT lib @Validate decorator
// Configures an EnTT property validation behavior
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const entt_1 = require("../../entt");
// Define a unique symbol for Serializable decorator
const symbol = Symbol('@Validate');
/**
 * @Validate() decorator, configures property validation behavior
 * @param type Type to validate against
 * @param provider Validation provider, supports:
 * - Custom validation function of following shape: (obj, value) => Error[] | Error | string | boolean
 * - @hapi/joi:   https://www.npmjs.com/package/@hapi/joi
 * - joi-browser: https://www.npmjs.com/package/joi-browser
 * - yup:         https://www.npmjs.com/package/yup
 */
function Validate({ type = undefined, provider = undefined } = {}) {
    // Return decorator
    return (target, key) => {
        // Store @Validate metadata
        const decorators = entt_1._getClassMetadata(target.constructor).decorators, metadata = decorators[symbol] || (decorators[symbol] = {});
        if (!metadata[key]) {
            metadata[key] = {
                type,
                provider
            };
        }
    };
}
exports.Validate = Validate;
/**
 * Initializes and returns validity store for the instance
 * @param target EnTT class instance containing the validity data
 * @returns Instance's validity store
 */
function _readValidityMetadata(target) {
    const metadata = entt_1._getInstanceMetadata(target);
    return metadata.validity || (metadata.validity = {
        valid: true,
        errors: {}
    });
}
exports._readValidityMetadata = _readValidityMetadata;
/**
 * Validates all properties of object instance
 * @param target Object instance to validate all properties of
 * @returns Hashmap of all properties having validation errors
 */
function _validateObject(target) {
    var _a, _b;
    // Validate all properties
    const keys = Object.keys(((_b = (_a = entt_1._getClassMetadata(target.constructor)) === null || _a === void 0 ? void 0 : _a.decorators) === null || _b === void 0 ? void 0 : _b[symbol]) || {});
    return keys.reduce((errors, key) => {
        const propertyErrors = _validateProperty(target, key);
        if (propertyErrors && propertyErrors.length) {
            errors[key] = propertyErrors;
        }
        return errors;
    }, {});
}
exports._validateObject = _validateObject;
/**
 * Validates a property of target object instance
 * @param target Object instance to validate a property of
 * @param key Key of the property being validated
 * @param value (Optional) Property value being validated; if not present, current property value will be validated instead
 * @returns Array of validation errors
 */
function _validateProperty(target, key, value = entt_1._undefined) {
    var _a, _b, _c;
    // Get property metadata
    const metadata = (_c = (_b = (_a = entt_1._getClassMetadata(target.constructor)) === null || _a === void 0 ? void 0 : _a.decorators) === null || _b === void 0 ? void 0 : _b[symbol]) === null || _c === void 0 ? void 0 : _c[key];
    if (!metadata) {
        return [];
    }
    // Get instance validity and reset errors
    const validity = _readValidityMetadata(target), errors = (validity.errors[key] = []);
    // Check if value passed, or should be assumed from property (Using _undefined Symbol to allow undefined as a legitimate value being set)
    if (value === entt_1._undefined) {
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
            }
            else if (typeof err === 'string') {
                // Create error from string
                errors.push(new Error(err));
            }
            else if (err instanceof Error) {
                // Take error
                errors.push(err);
            }
            else if (err instanceof Array) {
                // Take errors
                err.forEach((err) => {
                    if (typeof err === 'string') {
                        // Create error from string
                        errors.push(new Error(err));
                    }
                    else if (err instanceof Error) {
                        // Take error
                        errors.push(err);
                    }
                });
            }
        }
    }
    else if ((typeof metadata.provider === 'object') && (typeof metadata.provider.validate === 'function') && metadata.provider.__isYupSchema__) {
        // Validate using YUP validation
        try {
            metadata.provider.validateSync(value);
        }
        catch (err) {
            err.errors.forEach((err) => {
                const msg = (err.substr(0, 5) === 'this ' ? `Value ${JSON.stringify(value)} ${err.substr(5)}` : err);
                errors.push(new Error(msg));
            });
        }
    }
    else if ((typeof metadata.provider === 'object') && (typeof metadata.provider.validate === 'function')) {
        // Validate using attached .validate() method
        const err = metadata.provider.validate(value).error;
        if (err && err.isJoi) {
            // Process JOI errors result
            err.details.forEach((err) => {
                const msg = err.message.replace(/"value"/g, `Value ${JSON.stringify(value)}`);
                errors.push(new Error(msg));
            });
        }
        else if (err instanceof Error) {
            // Process explicit errors
            errors.push(err);
        }
    }
    // Update target valid status
    validity.valid = !Object.values(validity.errors)
        .filter((errs) => !!errs.length).length;
    // Output validation result
    return errors;
}
exports._validateProperty = _validateProperty;
//# sourceMappingURL=index.js.map