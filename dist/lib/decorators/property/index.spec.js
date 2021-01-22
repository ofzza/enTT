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
        __1.Property({ get: (value, obj) => `${obj.plain}:${value && value.toUpperCase()}` }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customgetter", void 0);
    tslib_1.__decorate([
        __1.Property({ set: (value, obj) => `${obj.plain}:${value && value.toUpperCase()}` }),
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
        it("Custom getter and setter reflect changes to other, referenced properties' values", () => {
            const test = new Test();
            test.plain = 'no-longer-plain';
            test.customsetter = 'test';
            test.customgetter = 'test';
            tests_init_1.assert(test.customgetter === 'no-longer-plain:TEST');
            tests_init_1.assert(test.customsetter === 'no-longer-plain:TEST');
        });
    });
    it('Allows overriding when extending EnTT classes', () => {
        class TestBase extends __1.EnTT {
            constructor() {
                super();
                this.prop = undefined;
                super.entt();
            }
        }
        tslib_1.__decorate([
            __1.Property({
                enumerable: false,
                set: false,
                get: false,
            }),
            tslib_1.__metadata("design:type", Object)
        ], TestBase.prototype, "prop", void 0);
        class Test extends TestBase {
            constructor() {
                super();
                this.prop = undefined;
                super.entt();
            }
        }
        tslib_1.__decorate([
            __1.Property({
                enumerable: true,
                set: (value, obj) => value && value.toUpperCase(),
                get: (value, obj) => `!${value && value.toUpperCase()}!`,
            }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "prop", void 0);
        const base = new TestBase();
        tests_init_1.assert(Object.keys(base).length === 0);
        expect(() => {
            base.prop = 'test';
        }).toThrow();
        tests_init_1.assert(base.prop === undefined);
        const test = new Test();
        tests_init_1.assert(Object.keys(test).length === 1);
        test.prop = 'test';
        tests_init_1.assert(test.prop === '!TEST!');
    });
    describe('Allows tagging of properties', () => {
        class Test extends __1.EnTT {
            constructor() {
                super();
                this.propA = undefined;
                this.propB = undefined;
                this.propC = undefined;
                this.propD = undefined;
                super.entt();
            }
        }
        tslib_1.__decorate([
            __1.Property({ tag: 'A' }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propA", void 0);
        tslib_1.__decorate([
            __1.Property({ tag: 'B' }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propB", void 0);
        tslib_1.__decorate([
            __1.Property({ tag: ['C', 'X'] }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propC", void 0);
        tslib_1.__decorate([
            __1.Property({ tag: ['D', 'X'] }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propD", void 0);
        it('Finds properties tagged with a single tag', () => {
            const propsA = Test.findTaggedProperties('A');
            tests_init_1.assert(propsA.length === 1);
            tests_init_1.assert(propsA[0] === 'propA');
            const propsB = __1.EnTT.findTaggedProperties('B', { from: Test });
            tests_init_1.assert(propsB.length === 1);
            tests_init_1.assert(propsB[0] === 'propB');
        });
        it('Finds properties tagged with a multiple tags', () => {
            const propsX1 = Test.findTaggedProperties('X');
            tests_init_1.assert(propsX1.length === 2);
            tests_init_1.assert(propsX1[0] === 'propC');
            tests_init_1.assert(propsX1[1] === 'propD');
            const propsX2 = __1.EnTT.findTaggedProperties('X', { from: Test });
            tests_init_1.assert(propsX2.length === 2);
            tests_init_1.assert(propsX2[0] === 'propC');
            tests_init_1.assert(propsX2[1] === 'propD');
        });
    });
});
//# sourceMappingURL=index.spec.js.map