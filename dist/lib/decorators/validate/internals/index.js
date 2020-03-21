"use strict";
// enTT lib @Validate decorator's internals
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const internals_1 = require("../../../entt/internals");
// Define a unique symbol for Serializable decorator
exports._symbolValidate = Symbol('@Validate');
/**
 * Initializes and returns validity store for the instance
 * @param target EnTT class instance containing the validity data
 * @returns Instance's validity store
 */
function _readValidityMetadata(target) {
    const metadata = internals_1._getInstanceMetadata(target);
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
    const keys = Object.keys(((_b = (_a = internals_1._getClassMetadata(target.constructor)) === null || _a === void 0 ? void 0 : _a.decorators) === null || _b === void 0 ? void 0 : _b[exports._symbolValidate]) || {});
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
function _validateProperty(target, key, value = internals_1._undefined) {
    var _a, _b, _c;
    // Get property metadata
    const metadata = (_c = (_b = (_a = internals_1._getClassMetadata(target.constructor)) === null || _a === void 0 ? void 0 : _a.decorators) === null || _b === void 0 ? void 0 : _b[exports._symbolValidate]) === null || _c === void 0 ? void 0 : _c[key];
    if (!metadata) {
        return [];
    }
    // Get instance validity and reset errors
    const validity = _readValidityMetadata(target), errors = (validity.errors[key] = []);
    // Check if value passed, or should be assumed from property (Using _undefined Symbol to allow undefined as a legitimate value being set)
    if (value === internals_1._undefined) {
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
            metadata.provider.validateSync(value, { context: target });
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
        const err = metadata.provider.validate(value, { context: target }).error;
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
/**
 * Returns validation status of the instance
 * @param target target instance being validated
 * @returns If instance is validated
 */
function _isValid(target) {
    // using @Validate
    // Return if local invalid
    const valid = _readValidityMetadata(target).valid;
    if (!valid) {
        return false;
    }
    // Return if any of children invalid
    for (const c of internals_1._getInstanceMetadata(target).children) {
        if (!c.child.valid) {
            return false;
        }
    }
    // Return valid by default
    return true;
}
exports._isValid = _isValid;
/**
 * Returns validation errors of all properties
 * @param target target instance being validated
 * @returns A hashmap of arrays of errors per property
 */
function _getValidationErrors(target) {
    // using @Validate  // TODO: Track every child's path
    // Initialize all errors
    const allErrors = {};
    // Read local errors
    const errors = _readValidityMetadata(target).errors;
    Object.keys(errors)
        .forEach((key) => {
        // Add local errors per each property
        if (errors[key].length) {
            if (!allErrors[key]) {
                allErrors[key] = [];
            }
            allErrors[key] = [...errors[key]];
        }
    });
    // Read children
    for (const c of internals_1._getInstanceMetadata(target).children) {
        // Add child errors per each property
        const childErrors = c.child.errors;
        Object.keys(childErrors)
            .forEach((childKey) => {
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
exports._getValidationErrors = _getValidationErrors;
//# sourceMappingURL=index.js.map