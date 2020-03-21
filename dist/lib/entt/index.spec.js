"use strict";
// enTT lib base class tests
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const tests_init_1 = require("../../tests.init");
const __1 = require("../../");
const _1 = require("./");
// Test ...
describe('class EnTT', () => {
    it('Initializes enTT metadata namespaces on extending classes and instances', () => {
        class NonEnTT {
        }
        const nonEnTT = new NonEnTT();
        tests_init_1.assert(!(nonEnTT instanceof __1.EnTT));
        tests_init_1.assert(_1._getInstanceMetadata(nonEnTT) !== undefined);
        tests_init_1.assert(_1._getClassMetadata(nonEnTT.constructor) !== undefined);
        class NotInitializedEnTT extends __1.EnTT {
        }
        const notInitializedEnTT = new NotInitializedEnTT();
        tests_init_1.assert(notInitializedEnTT instanceof __1.EnTT);
        tests_init_1.assert(_1._getInstanceMetadata(notInitializedEnTT) !== undefined);
        tests_init_1.assert(_1._getClassMetadata(notInitializedEnTT.constructor) !== undefined);
        class InitializedEnTT extends __1.EnTT {
            constructor() { super(); super.entt(); }
        }
        const initializedEnTT = new InitializedEnTT();
        tests_init_1.assert(initializedEnTT instanceof __1.EnTT);
        tests_init_1.assert(_1._getInstanceMetadata(initializedEnTT) !== undefined);
        tests_init_1.assert(_1._getClassMetadata(initializedEnTT.constructor) !== undefined);
    });
    it('Allow occlusion of prototype methods', () => {
        // TODO: check occlusion of: serialize
        // TODO: check occlusion of: deserialize
        // TODO: check occlusion of: valid
        // TODO: check occlusion of: errors
    });
});
//# sourceMappingURL=index.spec.js.map