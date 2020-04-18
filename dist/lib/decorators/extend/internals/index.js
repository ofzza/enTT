"use strict";
// enTT lib @Extend decorator's internals
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const internals_1 = require("../../../entt/internals");
// Define a unique symbol for Property decorator
exports._symbolExtend = Symbol('@Extend');
/**
 * Gets @Extend decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Extend decorator metadata
 */
function _readPropertyMetadata(Class) {
    return internals_1._getDecoratorMetadata(Class, exports._symbolExtend) || {};
}
exports._readPropertyMetadata = _readPropertyMetadata;
//# sourceMappingURL=index.js.map