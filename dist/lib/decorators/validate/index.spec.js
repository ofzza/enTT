"use strict";
// enTT lib @Validate decorator tests
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Import dependencies
const tests_init_1 = require("../../../tests.init");
const __1 = require("../../../");
const internals_1 = require("./internals");
// Import validation providers
const Joi = tslib_1.__importStar(require("joi"));
const JoiBrowser = tslib_1.__importStar(require("joi-browser"));
const Yup = tslib_1.__importStar(require("yup"));
// Test ...
describe('@Validate', () => {
    // Initialize test data models
    class InnerTest extends __1.EnTT {
        constructor() {
            super();
            this.naturalNum = 1;
            super.entt();
        }
    }
    tslib_1.__decorate([
        __1.Validate({
            type: 'number',
            provider: (value, obj) => typeof value === 'number' && Math.trunc(value) === value && value > 0,
        }),
        tslib_1.__metadata("design:type", Object)
    ], InnerTest.prototype, "naturalNum", void 0);
    class Test extends __1.EnTT {
        constructor() {
            super();
            this.customNaturalNum = 1;
            this.joiNaturalNum = 2;
            this.joiBrowserNaturalNum = 3;
            this.yupNaturalNum = 4;
            this.enttsingle = new InnerTest();
            this.enttarrayliteral = [new InnerTest(), new InnerTest(), new InnerTest()];
            this.enttobjectliteral = { a: new InnerTest(), b: new InnerTest(), c: new InnerTest() };
            super.entt();
        }
    }
    tslib_1.__decorate([
        __1.Validate({
            type: 'number',
            provider: (value, obj) => typeof value === 'number' && Math.trunc(value) === value && value > 0,
        }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customNaturalNum", void 0);
    tslib_1.__decorate([
        __1.Validate({
            type: 'number',
            provider: Joi.number().strict().integer().min(1),
        }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "joiNaturalNum", void 0);
    tslib_1.__decorate([
        __1.Validate({
            type: 'number',
            provider: JoiBrowser.number().strict().integer().min(1),
        }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "joiBrowserNaturalNum", void 0);
    tslib_1.__decorate([
        __1.Validate({
            type: 'number',
            provider: Yup.number().strict().integer().min(1),
        }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "yupNaturalNum", void 0);
    // Run tests
    describe('Works with different validation providers', () => {
        it('custom', () => {
            verifyNaturalNumProperty(Test, 'customNaturalNum');
        });
        it('joi', () => {
            verifyNaturalNumProperty(Test, 'joiNaturalNum');
        });
        it('joi-browser', () => {
            verifyNaturalNumProperty(Test, 'joiBrowserNaturalNum');
        });
        it('yup', () => {
            verifyNaturalNumProperty(Test, 'yupNaturalNum');
        });
    });
    describe('Works with nested EnTTs', () => {
        it('Nested single EnTT', () => {
            const instance = new Test();
            // Test invalid nested values
            instance.enttsingle.naturalNum = '-3.14';
            {
                const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
                tests_init_1.assert(instance.valid === false);
                tests_init_1.assert(errors.length === 2);
            }
            // Test valid nested values
            instance.enttsingle.naturalNum = 1;
            {
                const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
                tests_init_1.assert(instance.valid === true);
                tests_init_1.assert(errors.length === 0);
            }
        });
        it('Nested EnTT array', () => {
            const instance = new Test();
            // Test invalid nested values
            instance.enttarrayliteral.forEach(instance => {
                instance.naturalNum = '-3.14';
            });
            {
                const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
                tests_init_1.assert(instance.valid === false);
                tests_init_1.assert(errors.length === 6);
            }
            // Test valid nested values
            instance.enttarrayliteral.forEach(instance => {
                instance.naturalNum = 1;
            });
            {
                const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
                tests_init_1.assert(instance.valid === true);
                tests_init_1.assert(errors.length === 0);
            }
        });
        it('Nested EnTT hashmap', () => {
            const instance = new Test();
            // Test invalid nested values
            Object.values(instance.enttobjectliteral).forEach(instance => {
                instance.naturalNum = '-3.14';
            });
            {
                const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
                tests_init_1.assert(instance.valid === false);
                tests_init_1.assert(errors.length === 6);
            }
            // Test valid nested values
            Object.values(instance.enttobjectliteral).forEach(instance => {
                instance.naturalNum = 1;
            });
            {
                const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
                tests_init_1.assert(instance.valid === true);
                tests_init_1.assert(errors.length === 0);
            }
        });
    });
    it('Allows overriding when extending EnTT classes', () => {
        class TestBase extends __1.EnTT {
            constructor() {
                super();
                this.propA = true;
                this.propB = true;
                this.entt();
            }
        }
        tslib_1.__decorate([
            __1.Validate({ type: 'boolean' }),
            tslib_1.__metadata("design:type", Object)
        ], TestBase.prototype, "propA", void 0);
        tslib_1.__decorate([
            __1.Validate({ provider: (value, obj) => !!value }),
            tslib_1.__metadata("design:type", Object)
        ], TestBase.prototype, "propB", void 0);
        class Test extends TestBase {
            constructor() {
                super();
                this.propA = 0;
                this.propB = 0;
                this.entt();
            }
        }
        tslib_1.__decorate([
            __1.Validate({ type: 'number' }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propA", void 0);
        tslib_1.__decorate([
            __1.Validate({ provider: (value, obj) => value < 10 }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propB", void 0);
        const base = new TestBase();
        tests_init_1.assert(base.valid === true);
        tests_init_1.assert(base.valid === true);
        base.propA = false;
        tests_init_1.assert(base.valid === true);
        base.propB = false;
        tests_init_1.assert(base.valid === false);
        const test = new Test();
        tests_init_1.assert(test.valid === true);
        tests_init_1.assert(test.valid === true);
        test.propA = false;
        tests_init_1.assert(test.valid === false);
        tests_init_1.assert(test.errors.propA.length === 1);
        test.propB = 100;
        tests_init_1.assert(test.valid === false);
        tests_init_1.assert(test.errors.propB.length === 1);
    });
});
/**
 * Verifies validation for natural number property
 * @param Class Class to verify
 * @param key Property key
 */
function verifyNaturalNumProperty(Class, key) {
    // Explicitly test valid object
    {
        const instance = new Class();
        // Test initial, valid values
        verifyNaturalNumPropertyErrors(instance, key);
        tests_init_1.assert(Object.keys(internals_1._validateObject(instance)).length === 0);
        tests_init_1.assert(instance.valid === true);
        tests_init_1.assert(Object.values(instance.errors).length === 0);
    }
    // Explicitly test invalid object
    {
        const instance = new Class();
        // Set invalid value and manually run validation
        instance[key] = '-3.14';
        tests_init_1.assert(Object.keys(internals_1._validateObject(instance)).length === 1);
        tests_init_1.assert(instance.valid === false);
        tests_init_1.assert(Object.values(instance.errors).length === 1);
        tests_init_1.assert(!!instance.errors[key]);
        tests_init_1.assert(instance.errors[key].length === 2);
        // Revert invalid value
        instance.revert(key);
        tests_init_1.assert(instance.valid === true);
        tests_init_1.assert(Object.values(instance.errors).length === 0);
    }
    // Implicitly test invalid object
    {
        const instance = new Class();
        // Set invalid value
        instance[key] = '-3.14';
        tests_init_1.assert(instance.valid === false);
        tests_init_1.assert(Object.values(instance.errors).length === 1);
        tests_init_1.assert(!!instance.errors[key]);
        tests_init_1.assert(instance.errors[key].length === 2);
        // Revert invalid value
        instance.revert(key);
        tests_init_1.assert(instance.valid === true);
        tests_init_1.assert(Object.values(instance.errors).length === 0);
    }
}
/**
 * Verify validation errors for natural number property
 * @param instance Parent object hosting the property
 * @param key Property key
 */
function verifyNaturalNumPropertyErrors(instance, key) {
    {
        const errors = internals_1._validateProperty(instance, key, 1);
        tests_init_1.assert(errors.length === 0);
    }
    {
        const errors = internals_1._validateProperty(instance, key, '1');
        tests_init_1.assert(errors.length === 2);
        tests_init_1.assert(errors[0] instanceof Error);
        tests_init_1.assert(errors[1] instanceof Error);
    }
    {
        const errors = internals_1._validateProperty(instance, key, -3);
        tests_init_1.assert(errors.length === 1);
        tests_init_1.assert(errors[0] instanceof Error);
    }
    {
        const errors = internals_1._validateProperty(instance, key, -3.14);
        tests_init_1.assert(errors.length === 1);
        tests_init_1.assert(errors[0] instanceof Error);
    }
}
//# sourceMappingURL=index.spec.js.map