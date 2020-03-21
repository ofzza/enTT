"use strict";
// enTT lib @Property decorator's internals
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const internals_1 = require("../../../entt/internals");
// Define a unique symbol for Property decorator
exports._symbolProperty = Symbol('@Property');
/**
 * Gets @Property decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Property decorator metadata
 */
function _readPropertyMetadata(Class) {
    var _a, _b;
    return ((_b = (_a = internals_1._getClassMetadata(Class)) === null || _a === void 0 ? void 0 : _a.decorators) === null || _b === void 0 ? void 0 : _b[exports._symbolProperty]) || {};
}
exports._readPropertyMetadata = _readPropertyMetadata;
/**
 * Fetches basic property behavior metadata
 * @param target Class to fetch property metadata for
 * @param key Property key to fetch property metadata for
 * @param store Private store for all property values
 * @returns Property descriptor
 */
function _readPropertyDescriptor({ target = undefined, key = undefined, store = undefined } = {}) {
    // Get @Property metadata (or defaults)
    const metadata = _readPropertyMetadata(target.constructor)[key] || {
        get: true,
        set: true,
        enumerable: true
    };
    return {
        // Define property getter
        get: (metadata.get === false ? undefined : () => {
            if (typeof metadata.get === 'function') {
                // Use specified function in getter
                return metadata.get(target, store[key]);
            }
            else if (metadata.get === true) {
                // Use default, pass-through getter
                return store[key];
            }
        }),
        // Define property setter
        set: (metadata.set === false ? undefined : (value) => {
            if (typeof metadata.set === 'function') {
                // Use specified function in setter
                store[key] = metadata.set(target, value);
            }
            else if (metadata.set === true) {
                // Use default, pass-through setter
                store[key] = value;
            }
        }),
        // Define if property is enumerable
        enumerable: !!metadata.enumerable
    };
}
exports._readPropertyDescriptor = _readPropertyDescriptor;
//# sourceMappingURL=index.js.map