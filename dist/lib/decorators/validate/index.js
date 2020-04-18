"use strict";
// enTT lib @Validate decorator
// Configures an EnTT property validation behavior
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import and (re)export internals
const internals_1 = require("./internals");
exports.EnttValidationError = internals_1.EnttValidationError;
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
    // Set defaults
    const defaults = {
        type: undefined,
        provider: undefined
    };
    // Return decorator
    return (target, key) => {
        var _a, _b;
        // Store @Serializable metadata (configured value, or else inherited value, or else default value)
        const metadata = internals_2._getDecoratorMetadata(target.constructor, internals_1._symbolValidate);
        metadata[key] = {
            key,
            type: (type !== undefined ? type : (((_a = metadata[key]) === null || _a === void 0 ? void 0 : _a.type) !== undefined ? metadata[key].type : defaults.type)),
            provider: (provider !== undefined ? provider : (((_b = metadata[key]) === null || _b === void 0 ? void 0 : _b.provider) !== undefined ? metadata[key].provider : defaults.provider))
        };
    };
}
exports.Validate = Validate;
//# sourceMappingURL=index.js.map