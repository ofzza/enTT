"use strict";
// enTT lib @Validate decorator
// Configures an EnTT property validation behavior
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import and (re)export internals
const internals_1 = require("./internals");
exports._symbolValidate = internals_1._symbolValidate;
exports._readValidityMetadata = internals_1._readValidityMetadata;
exports._validateObject = internals_1._validateObject;
exports._validateProperty = internals_1._validateProperty;
exports._isValid = internals_1._isValid;
exports._getValidationErrors = internals_1._getValidationErrors;
// Import dependencies
const internals_2 = require("../../entt/internals");
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
        const decorators = internals_2._getClassMetadata(target.constructor).decorators, metadata = decorators[internals_1._symbolValidate] || (decorators[internals_1._symbolValidate] = {});
        if (!metadata[key]) {
            metadata[key] = {
                type,
                provider
            };
        }
    };
}
exports.Validate = Validate;
//# sourceMappingURL=index.js.map