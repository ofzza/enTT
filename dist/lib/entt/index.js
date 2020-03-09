"use strict";
// enTT lib main, extensible class
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const property_1 = require("../decorators/property");
const serializable_1 = require("../decorators/serializable");
const validate_1 = require("../decorators/validate");
// Define a unique symbol for Property decorator
const symbol = Symbol('EnTT');
exports._undefined = Symbol('undefined');
/**
 * Main, extensible EnTT class definition
 */
class EnTT {
    /**
     * Casts a value of given type as an instance of a parent EnTT Class
     * @param value Value being cast
     * @param type Type of value being cast
     * @param Class (Optional) Class to cast into
     * @returns Instance of the class with deserialized data
     */
    static cast(value, type = 'object', { Class = undefined } = {}) {
        // using @Serializable
        const CastIntoClass = (Class || this.prototype.constructor);
        return serializable_1._cast(CastIntoClass)(value, type);
    }
    /**
     * Initializes EnTT features for the extending class - should be called in extending class' constructor, right after "super()".
     * Example:
     *   constructor () { super(); super.entt(); }
     */
    entt() {
        // Initialize metadata on the derived class
        const classMetadata = _getClassMetadata(this.constructor);
        // Initialize metadata on the instance (non-enumerable an hidden-ish)
        const instanceMetadata = _getInstanceMetadata(this);
        // Replace properties with dynamic counterparts
        _replacePropertiesWithGetterSetters.bind(this)({
            store: instanceMetadata.store,
            restore: instanceMetadata.restore
        });
    }
    /**
     * Serializes (extracts underlying instance state) Class instance as value of given type
     * @param type Value type to serialize as
     * @returns Serialized value of requested type
     */
    serialize(type = 'object') {
        // using @Serializable
        return serializable_1._serialize(this, type);
    }
    /**
     * Deserializes value of given type into a target
     * @param value Value being deserialized from
     * @param type Type of value to deserialized form
     * @return Target with given value deserialized into it
     */
    deserialize(value, type = 'object') {
        // using @Serializable
        return serializable_1._deserialize(value, type, { target: this });
    }
    /**
     * Returns validation status of the instance
     */
    get valid() {
        // using @Validate
        return validate_1._readValidityMetadata(this).valid;
    }
    /**
     * Returns validation errors of all properties
     */
    get errors() {
        // using @Validate
        const errors = validate_1._readValidityMetadata(this).errors;
        return Object.keys(errors)
            .reduce((result, key) => {
            result[key] = [...errors[key]];
            return result;
        }, {});
    }
    /**
     * Reverts property value(s) of requested property (or all properties if no property key specified) to last valid value
     * @param key (Optional) Property key of the property to be reverted
     */
    revert(key) {
        const store = _getInstanceMetadata(this).store, restore = _getInstanceMetadata(this).restore, errors = validate_1._readValidityMetadata(this).errors, keys = (key ? [key] : Object.keys(restore));
        keys.forEach((key) => {
            if (errors[key].length) {
                // Undo to latest valid value
                store[key] = restore[key];
                // Revalidate
                validate_1._validateProperty(this, key);
            }
        });
    }
}
exports.EnTT = EnTT;
/**
 * Initializes and gets stored EnTT class metadata
 * @param Class EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
function _getClassMetadata(Class) {
    // Initialize metadata on the derived class
    if (Class && !Class[symbol]) {
        Object.defineProperty(Class, symbol, {
            enumerable: false,
            value: {
                // Initialize a private decorators store
                decorators: {}
            }
        });
    }
    // Return metadata reference
    return Class[symbol] || {};
}
exports._getClassMetadata = _getClassMetadata;
/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
function _getInstanceMetadata(instance) {
    // Initialize metadata on the instance (non-enumerable an hidden-ish)
    if (instance && !instance[symbol]) {
        Object.defineProperty(instance, symbol, {
            enumerable: false,
            value: {
                // Initialize a private property values' store
                store: {},
                // Initialize a private property values' store of last valid values
                restore: {}
            }
        });
    }
    // Return metadata reference
    return instance[symbol] || {};
}
exports._getInstanceMetadata = _getInstanceMetadata;
/**
 * Replaces properties with dynamic counterparts
 * @param store Private store for all property values
 */
function _replacePropertiesWithGetterSetters({ store = undefined, restore = undefined, } = {}) {
    // Iterate over properties
    for (const key of Object.keys(this)) {
        // Check if own property
        if (this.hasOwnProperty(key)) {
            if (typeof this[key] !== 'function') {
                // Get initial value
                const value = this[key];
                // Generate property descriptor (advised by @Property)
                const descriptor = property_1._readPropertyDescriptor({ target: this, key, store });
                // Wrap descriptor setter
                if (descriptor.set) {
                    const previousSetter = descriptor.set;
                    descriptor.set = (value) => {
                        // Deffer to originally set up setter
                        previousSetter(value);
                        // Validate property (using @Validate)
                        const errors = validate_1._validateProperty(this, key);
                        // If valid, store as last validated value
                        if (!errors.length) {
                            restore[key] = store[key];
                        }
                    };
                }
                // Replace property with a custom property
                Object.defineProperty(this, key, Object.assign({ configurable: false }, descriptor));
                // Store initial value (through property custom setter, if available)
                if (descriptor.set) {
                    this[key] = value;
                }
                else {
                    store[key] = value;
                }
            }
        }
    }
}
//# sourceMappingURL=index.js.map