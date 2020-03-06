"use strict";
// enTT lib base class tests
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const __1 = require("../../");
// Test ...
describe("class EnTT", () => {
    it('Initializes enTT metadata namespace on extending classes', () => {
        class NonEnTT {
        }
        const nonEnTT = new NonEnTT();
        expect(nonEnTT instanceof __1.EnTT).toBeFalse();
        expect(nonEnTT.constructor.__enTT__).toBeUndefined();
        class NotInitializedEnTT extends __1.EnTT {
        }
        const notInitializedEnTT = new NotInitializedEnTT();
        expect(notInitializedEnTT instanceof __1.EnTT).toBeTrue();
        expect(notInitializedEnTT.constructor.__enTT__).toBeUndefined();
        class InitializedEnTT extends __1.EnTT {
            constructor() { super(); super.entt(); }
        }
        const initializedEnTT = new InitializedEnTT();
        expect(initializedEnTT instanceof __1.EnTT).toBeTrue();
        expect(initializedEnTT.constructor.__enTT__).not.toBeUndefined();
    });
});
//# sourceMappingURL=index.spec.js.map