"use strict";
// enTT lib @Property decorator tests
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Import dependencies
const tests_init_1 = require("../../../tests.init");
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
        __1.Property({ get: (obj, value) => `${obj.plain}:${value && value.toUpperCase()}` }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customgetter", void 0);
    tslib_1.__decorate([
        __1.Property({ set: (obj, value) => `${obj.plain}:${value && value.toUpperCase()}` }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customsetter", void 0);
    it('Replaces properties with dynamic counterparts', () => {
        const test = new Test();
        tests_init_1.assert(test.plain === 'plain');
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'plain').get);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'plain').get);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'plain').set);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'plain').enumerable === true);
        tests_init_1.assert(test.enttized === 'enttized');
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'enttized').get);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'enttized').set);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'enttized').enumerable === true);
    });
    it('Sets property enumerable state', () => {
        const test = new Test();
        tests_init_1.assert(test.nonenumerable === 'nonenumerable');
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'nonenumerable').get);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'nonenumerable').set);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'nonenumerable').enumerable === false);
    });
    it('Can set property with only a getter', () => {
        const test = new Test();
        tests_init_1.assert(test.getteronly === 'getteronly');
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'getteronly').get);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'getteronly').set === undefined);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'getteronly').enumerable === true);
    });
    it('Can set property with only a setter', () => {
        const test = new Test();
        tests_init_1.assert(test.setteronly === undefined);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'setteronly').get === undefined);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'setteronly').set);
        tests_init_1.assert(Object.getOwnPropertyDescriptor(test, 'setteronly').enumerable === true);
    });
    describe('Can set property with custom getter and setter', () => {
        it('Custom getter reflects changes to property value', () => {
            const test = new Test();
            tests_init_1.assert(test.customgetter === 'plain:CUSTOMGETTER');
            test.customgetter = 'test';
            tests_init_1.assert(test.customgetter === 'plain:TEST');
        });
        it('Custom setter reflects changes to property value', () => {
            const test = new Test();
            tests_init_1.assert(test.customsetter === 'plain:CUSTOMSETTER');
            test.customsetter = 'test';
            tests_init_1.assert(test.customsetter === 'plain:TEST');
        });
        it('Custom getter and setter reflect changes to other, referenced properties\' values', () => {
            const test = new Test();
            test.plain = 'no-longer-plain';
            test.customsetter = 'test';
            test.customgetter = 'test';
            tests_init_1.assert(test.customgetter === 'no-longer-plain:TEST');
            tests_init_1.assert(test.customsetter === 'no-longer-plain:TEST');
        });
    });
});
//# sourceMappingURL=index.spec.js.map