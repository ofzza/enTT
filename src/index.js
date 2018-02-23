// =====================================================================================================================
// ENTITY
// =====================================================================================================================

// Export EnTT class as default
import EnTT from './entt';
export default EnTT;

// Export Entity extension class
export { default as EnTTExt } from './enttext';

// Export extensions
export { default as DynamicPropertiesExtension } from './ext/dynamic-properties';
export { default as ValidationExtension } from './ext/validation';
