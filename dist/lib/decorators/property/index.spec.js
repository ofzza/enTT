"use strict";
// enTT lib @Property decorator tests
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Import dependencies
const __1 = require("../../../");
// Test ...
describe('@Property', () => {
    class Test extends __1.EnTT {
        constructor() {
            super();
            this.plain = 'plain';
            this.enttized = 'enttized';
            this.nonenumerable = 'nonenumerable';
            this.getteronly = 'getteronly';
            this.setteronly = 'setteronly';
            this.customgetter = 'customgetter';
            this.customsetter = 'customsetter';
            super.entt();
        }
    }
    tslib_1.__decorate([
        __1.Property(),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "enttized", void 0);
    tslib_1.__decorate([
        __1.Property({ enumerable: false }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "nonenumerable", void 0);
    tslib_1.__decorate([
        __1.Property({ set: false }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "getteronly", void 0);
    tslib_1.__decorate([
        __1.Property({ get: false }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "setteronly", void 0);
    tslib_1.__decorate([
        __1.Property({ get: (target, value) => `${target.plain}:${value && value.toUpperCase()}` }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customgetter", void 0);
    tslib_1.__decorate([
        __1.Property({ set: (target, value) => `${target.plain}:${value && value.toUpperCase()}` }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customsetter", void 0);
    it('Replaces properties with dynamic counterparts', () => {
        const test = new Test();
        expect(test.plain).toEqual('plain');
        expect(Object.getOwnPropertyDescriptor(test, 'plain').get).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'plain').get).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'plain').set).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'plain').enumerable).toEqual(true);
        expect(test.enttized).toEqual('enttized');
        expect(Object.getOwnPropertyDescriptor(test, 'enttized').get).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'enttized').set).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'enttized').enumerable).toEqual(true);
    });
    it('Sets property enumerable state', () => {
        const test = new Test();
        expect(test.nonenumerable).toEqual('nonenumerable');
        expect(Object.getOwnPropertyDescriptor(test, 'nonenumerable').get).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'nonenumerable').set).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'nonenumerable').enumerable).toEqual(false);
    });
    it('Can set property with only a getter', () => {
        const test = new Test();
        expect(test.getteronly).toEqual('getteronly');
        expect(Object.getOwnPropertyDescriptor(test, 'getteronly').get).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'getteronly').set).toBeUndefined();
        expect(Object.getOwnPropertyDescriptor(test, 'getteronly').enumerable).toEqual(true);
    });
    it('Can set property with only a setter', () => {
        const test = new Test();
        expect(test.setteronly).not.toEqual('setteronly');
        expect(Object.getOwnPropertyDescriptor(test, 'setteronly').get).toBeUndefined();
        expect(Object.getOwnPropertyDescriptor(test, 'setteronly').set).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(test, 'setteronly').enumerable).toEqual(true);
    });
    describe('Can set property with custom getter and setter', () => {
        it('Custom getter reflects changes to property value', () => {
            const test = new Test();
            expect(test.customgetter).toEqual('plain:CUSTOMGETTER');
            test.customgetter = 'test';
            expect(test.customgetter).toEqual('plain:TEST');
        });
        it('Custom setter reflects changes to property value', () => {
            const test = new Test();
            expect(test.customsetter).toEqual('customsetter');
            test.customsetter = 'test';
            expect(test.customsetter).toEqual('plain:TEST');
        });
        it('Custom getter and setter reflect changes to other, referenced properties\' values', () => {
            const test = new Test();
            test.plain = 'no-longer-plain';
            test.customsetter = 'test';
            test.customgetter = 'test';
            expect(test.customgetter).toEqual('no-longer-plain:TEST');
            expect(test.customsetter).toEqual('no-longer-plain:TEST');
        });
    });
});
//# sourceMappingURL=index.spec.js.map