"use strict";
// enTT lib @Serializable decorator tests
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Import dependencies
const tests_init_1 = require("../../../tests.init");
const __1 = require("../../../");
const internals_1 = require("./internals");
// Test ...
describe('@Serializable', () => {
    // Initialize test data models
    const obj = {
        a: undefined,
        false: undefined,
        null: undefined,
        undefined: undefined,
        // Using post-constructor initialization of values to avoid values already being there on deserialization,
        // preventing a fair check of serialization/deserialization
        initialize() {
            this.a = 'A';
            this.false = false;
            this.null = null;
            this.undefined = undefined;
            return this;
        }
    };
    class InnerNonEnTT {
        constructor() {
            this.w = undefined;
            this.false = undefined;
            this.null = undefined;
            this.undefined = undefined;
        }
        // Using post-constructor initialization of values to avoid values already being there on deserialization,
        // preventing a fair check of serialization/deserialization
        initialize() {
            this.w = 'W';
            this.false = false;
            this.null = null;
            this.undefined = undefined;
            return this;
        }
    }
    class NonEnTT {
        constructor() {
            this.z = undefined;
            this.innernonentity = undefined;
        }
        // Using post-constructor initialization of values to avoid values already being there on deserialization,
        // preventing a fair check of serialization/deserialization
        initialize() {
            this.z = 'Z';
            this.innernonentity = (new InnerNonEnTT()).initialize();
            return this;
        }
    }
    tslib_1.__decorate([
        __1.Serializable({ cast: InnerNonEnTT }),
        tslib_1.__metadata("design:type", Object)
    ], NonEnTT.prototype, "innernonentity", void 0);
    class InnerMostTest extends __1.EnTT {
        constructor() {
            super();
            this.y = undefined;
            this.nonentity = undefined;
            super.entt();
        }
        // Using post-constructor initialization of values to avoid values already being there on deserialization,
        // preventing a fair check of serialization/deserialization
        initialize() {
            this.y = 'Y';
            this.nonentity = (new NonEnTT()).initialize();
            return this;
        }
    }
    tslib_1.__decorate([
        __1.Serializable({ cast: NonEnTT }),
        tslib_1.__metadata("design:type", Object)
    ], InnerMostTest.prototype, "nonentity", void 0);
    class InnerTest extends __1.EnTT {
        constructor() {
            super();
            this.x = undefined;
            this.innermost = undefined;
            super.entt();
        }
        // Using post-constructor initialization of values to avoid values already being there on deserialization,
        // preventing a fair check of serialization/deserialization
        initialize() {
            this.x = 'X';
            this.innermost = (new InnerMostTest()).initialize();
            return this;
        }
    }
    tslib_1.__decorate([
        __1.Serializable({ cast: InnerMostTest }),
        tslib_1.__metadata("design:type", Object)
    ], InnerTest.prototype, "innermost", void 0);
    class Test extends __1.EnTT {
        constructor() {
            super();
            this.null = null;
            this.undefined = undefined;
            this.boolean = false;
            this.number = 1.234;
            this.string = 'abcde';
            this.array = [1, 2, 3, 4];
            this.object = { a: 1, b: 2, c: 3 };
            this.notaliased = undefined;
            this.enttsingle = undefined;
            this.enttarrayliteral = undefined;
            this.enttobjectliteral = undefined;
            this.nonenumerable = undefined;
            this.getteronly = 'getteronly';
            this.setteronly = undefined;
            this.customgetter = undefined;
            this.customsetter = undefined;
            super.entt();
        }
        // Using post-constructor initialization of values to avoid values already being there on deserialization,
        // preventing a fair check of serialization/deserialization
        initialize() {
            this.notaliased = '(not)aliased';
            this.enttsingle = (new InnerTest()).initialize();
            this.enttarrayliteral = [(new InnerTest()).initialize(), (new InnerTest()).initialize(), (new InnerTest()).initialize()];
            this.enttobjectliteral = { a: (new InnerTest()).initialize(), b: (new InnerTest()).initialize(), c: (new InnerTest()).initialize() };
            this.nonenumerable = 'nonenumerable';
            this.setteronly = 'setteronly';
            this.customgetter = 'customgetter';
            this.customsetter = 'customsetter';
            return this;
        }
    }
    tslib_1.__decorate([
        __1.Serializable({ alias: 'aliased' }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "notaliased", void 0);
    tslib_1.__decorate([
        __1.Serializable({ cast: InnerTest }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "enttsingle", void 0);
    tslib_1.__decorate([
        __1.Serializable({ cast: [InnerTest] }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "enttarrayliteral", void 0);
    tslib_1.__decorate([
        __1.Serializable({ cast: { InnerTest } }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "enttobjectliteral", void 0);
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
        __1.Property({ get: (obj, value) => `${obj.nonenumerable}:${value && value.toUpperCase()}` }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customgetter", void 0);
    tslib_1.__decorate([
        __1.Property({ set: (obj, value) => `${obj.nonenumerable}:${value && value.toUpperCase()}` }),
        tslib_1.__metadata("design:type", Object)
    ], Test.prototype, "customsetter", void 0);
    class ExtendedTestEntity extends Test {
        constructor() {
            super();
            this.dontserialize = undefined;
            super.entt();
        }
        // Using post-constructor initialization of values to avoid values already being there on deserialization,
        // preventing a fair check of serialization/deserialization
        initialize() {
            super.initialize();
            this.dontserialize = 'dontserialize';
            return this;
        }
    }
    tslib_1.__decorate([
        __1.Serializable({ serialize: false }),
        tslib_1.__metadata("design:type", Object)
    ], ExtendedTestEntity.prototype, "dontserialize", void 0);
    // Run tests
    describe('Works with non-EnTT objects', () => {
        it('Serializes and Deserializes raw objects', () => {
            const instance = obj.initialize(), { serialized, deserialized, reserialized } = verifySerialization(instance);
            verifyAny(instance, serialized, { verifyConstructors: false });
            verifyAny(instance, reserialized, { verifyConstructors: false });
            verifyAny(instance, deserialized, { verifyConstructors: true });
        });
        it('Casts as Objects', () => {
            const instance = obj.initialize(), { serialized, deserialized } = verifySerialization(instance), castSingle = internals_1._cast(Object)(serialized), castArray = internals_1._cast([Object])([serialized, serialized, serialized]), castHashmap = internals_1._cast({ Object })({ a: serialized, b: serialized, c: serialized });
            verifyAny(castSingle, instance, { verifyConstructors: true });
            verifyAny(castSingle, deserialized, { verifyConstructors: true });
            tests_init_1.assert(castArray instanceof Array);
            tests_init_1.assert(castArray.length === 3);
            verifyAny(castArray[0], instance, { verifyConstructors: true });
            verifyAny(castArray[0], deserialized, { verifyConstructors: true });
            tests_init_1.assert(castHashmap instanceof Object);
            tests_init_1.assert(Object.keys(castHashmap).length === 3);
            verifyAny(castHashmap.a, instance, { verifyConstructors: true });
            verifyAny(castHashmap.a, deserialized, { verifyConstructors: true });
        });
        it('Clones raw objects', () => {
            const instance = obj.initialize(), cloned = __1.EnTT.clone(instance);
            tests_init_1.assert(instance !== cloned);
            tests_init_1.assert(internals_1._serialize(instance, 'json') === internals_1._serialize(cloned, 'json'));
        });
    });
    describe('Works with non-EnTT class instances', () => {
        it('Serializes and Deserializes non-EnTT class instances', () => {
            const instance = (new NonEnTT()).initialize(), { serialized, deserialized, reserialized } = verifySerialization(instance);
            verifyAny(instance, serialized, { verifyConstructors: false });
            verifyAny(instance, reserialized, { verifyConstructors: false });
            verifyAny(instance, deserialized, { verifyConstructors: true });
        });
        it('Casts as non-EnTTs', () => {
            const instance = (new NonEnTT()).initialize(), { serialized, deserialized } = verifySerialization(instance), castSingle = internals_1._cast(NonEnTT)(serialized), castArray = internals_1._cast([NonEnTT])([serialized, serialized, serialized]), castHashmap = internals_1._cast({ NonEnTT })({ a: serialized, b: serialized, c: serialized });
            verifyAny(castSingle, instance, { verifyConstructors: true });
            verifyAny(castSingle, deserialized, { verifyConstructors: true });
            tests_init_1.assert(castArray instanceof Array);
            tests_init_1.assert(castArray.length === 3);
            verifyAny(castArray[0], instance, { verifyConstructors: true });
            verifyAny(castArray[0], deserialized, { verifyConstructors: true });
            tests_init_1.assert(castHashmap instanceof Object);
            tests_init_1.assert(Object.keys(castHashmap).length === 3);
            verifyAny(castHashmap.a, instance, { verifyConstructors: true });
            verifyAny(castHashmap.a, deserialized, { verifyConstructors: true });
        });
        it('Clones non-EnTT class instances', () => {
            const instance = (new NonEnTT()).initialize(), cloned = __1.EnTT.clone(instance);
            tests_init_1.assert(instance !== cloned);
            tests_init_1.assert(internals_1._serialize(instance, 'json') === internals_1._serialize(cloned, 'json'));
        });
    });
    describe('Works with EnTT class instances', () => {
        it('Serializes and Deserializes EnTT class instances', () => {
            const instance = (new Test()).initialize(), ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'], { serialized, deserialized, reserialized } = verifySerialization(instance);
            verifyAny(instance, serialized, { verifyConstructors: false, ignoreKeys });
            verifyAny(instance, reserialized, { verifyConstructors: false, ignoreKeys });
            verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
            const serializedDirectly = instance.serialize('object'), serializedIndirectly = internals_1._serialize(instance, 'object');
            expect(serializedDirectly).toEqual(serializedIndirectly);
            const deserializedDirectly = instance.deserialize(serializedDirectly, 'object'), deserializedIndirectly = internals_1._deserialize(serializedIndirectly, 'object', { target: new Test() });
            expect(deserializedDirectly).toEqual(deserializedIndirectly);
        });
        it('Casts as EnTTs', () => {
            const instance = (new Test()).initialize(), ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'], { serialized, deserialized } = verifySerialization(instance), castSingle = internals_1._cast(Test)(serialized), castArray = internals_1._cast([Test])([serialized, serialized, serialized]), castHashmap = internals_1._cast({ Test })({ a: serialized, b: serialized, c: serialized });
            verifyAny(castSingle, instance, { verifyConstructors: true, ignoreKeys });
            verifyAny(castSingle, deserialized, { verifyConstructors: true, ignoreKeys });
            tests_init_1.assert(castArray instanceof Array);
            tests_init_1.assert(castArray.length === 3);
            verifyAny(castArray[0], instance, { verifyConstructors: true });
            verifyAny(castArray[0], deserialized, { verifyConstructors: true });
            tests_init_1.assert(castHashmap instanceof Object);
            tests_init_1.assert(Object.keys(castHashmap).length === 3);
            verifyAny(castHashmap.a, instance, { verifyConstructors: true });
            verifyAny(castHashmap.a, deserialized, { verifyConstructors: true });
            const castExplicitlyDirectly = Test.cast(serialized, { into: Test }), castImplicitlyDirectly = Test.cast(serialized), castIndirectly = internals_1._cast(Test)(serialized);
            expect(instance).toEqual(castExplicitlyDirectly);
            expect(instance).toEqual(castImplicitlyDirectly);
            expect(instance).toEqual(castIndirectly);
        });
        it('Clones EnTT class instances', () => {
            const instance = (new Test()).initialize(), cloned = __1.EnTT.clone(instance);
            tests_init_1.assert(instance !== cloned);
            tests_init_1.assert(internals_1._serialize(instance, 'json') === internals_1._serialize(cloned, 'json'));
        });
    });
    describe('Works with extended EnTT class instances', () => {
        it('Serializes and Deserializes extended EnTT class instances', () => {
            const instance = (new ExtendedTestEntity()).initialize(), ignoreKeys = ['dontserialize', 'notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'], { serialized, deserialized, reserialized } = verifySerialization(instance, 'object', { skipDeserializeCheck: true });
            verifyAny(instance, serialized, { verifyConstructors: false, ignoreKeys });
            verifyAny(instance, reserialized, { verifyConstructors: false, ignoreKeys });
            verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
            const serializedDirectly = instance.serialize('object'), serializedIndirectly = internals_1._serialize(instance, 'object');
            expect(serializedDirectly).toEqual(serializedIndirectly);
        });
    });
    describe('Works with multiple serialization target types', () => {
        it('Works with JS object target', () => {
            const instance = (new Test()).initialize(), ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'], serialized = internals_1._serialize(instance, 'object'), deserialized = internals_1._deserialize(serialized, 'object', { target: new Test() });
            verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
            tests_init_1.assert(typeof serialized === 'object');
        });
        it('Works with JSON target', () => {
            const instance = (new Test()).initialize(), ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'], serialized = internals_1._serialize(instance, 'json'), deserialized = internals_1._deserialize(serialized, 'json', { target: new Test() });
            verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
            tests_init_1.assert(typeof serialized === 'string');
        });
    });
    it('Allows overriding when extending EnTT classes', () => {
        class Inner extends __1.EnTT {
            constructor() {
                super();
                this.prop = true;
                super.entt();
            }
        }
        class TestBase extends __1.EnTT {
            constructor() {
                super();
                this.propA = true;
                this.propB = undefined;
                super.entt();
            }
        }
        tslib_1.__decorate([
            __1.Serializable({ serialize: false, deserialize: false }),
            tslib_1.__metadata("design:type", Object)
        ], TestBase.prototype, "propA", void 0);
        tslib_1.__decorate([
            __1.Serializable({ alias: 'propB1', cast: Inner }),
            tslib_1.__metadata("design:type", Object)
        ], TestBase.prototype, "propB", void 0);
        class Test extends TestBase {
            constructor() {
                super();
                this.propA = true;
                this.propB = undefined;
                super.entt();
            }
        }
        tslib_1.__decorate([
            __1.Serializable({ serialize: true, deserialize: true }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propA", void 0);
        tslib_1.__decorate([
            __1.Serializable({ alias: 'propB2', cast: [Inner] }),
            tslib_1.__metadata("design:type", Object)
        ], Test.prototype, "propB", void 0);
        const base = new TestBase();
        base.deserialize({ propA: false, propB1: { prop: true } });
        tests_init_1.assert(base.propA === true);
        tests_init_1.assert(base.propB instanceof Inner);
        tests_init_1.assert(base.propB.prop === true);
        const test = new Test();
        test.deserialize({ propA: false, propB2: [{ prop: true }, { prop: false }] });
        tests_init_1.assert(test.propA === false);
        tests_init_1.assert(test.propB instanceof Array);
        tests_init_1.assert(test.propB.length === 2);
        tests_init_1.assert(test.propB[0].prop === true);
        tests_init_1.assert(test.propB[1].prop === false);
    });
    describe('Respects limiting or opting out of serialization', () => {
        class LimitedTest extends __1.EnTT {
            constructor() {
                super();
                this.serializeNever = undefined;
                this.serializeSerOnly = undefined;
                this.serializeDeSerOnly = undefined;
                this.serializeAlways = undefined;
                super.entt();
            }
            initialize() {
                this.serializeNever = 'initialized';
                this.serializeSerOnly = 'initialized';
                this.serializeDeSerOnly = 'initialized';
                this.serializeAlways = 'initialized';
                return this;
            }
        }
        tslib_1.__decorate([
            __1.Serializable({ serialize: false, deserialize: false }),
            tslib_1.__metadata("design:type", Object)
        ], LimitedTest.prototype, "serializeNever", void 0);
        tslib_1.__decorate([
            __1.Serializable({ serialize: true, deserialize: false }),
            tslib_1.__metadata("design:type", Object)
        ], LimitedTest.prototype, "serializeSerOnly", void 0);
        tslib_1.__decorate([
            __1.Serializable({ serialize: false, deserialize: true }),
            tslib_1.__metadata("design:type", Object)
        ], LimitedTest.prototype, "serializeDeSerOnly", void 0);
        tslib_1.__decorate([
            __1.Serializable({ serialize: true, deserialize: true }),
            tslib_1.__metadata("design:type", Object)
        ], LimitedTest.prototype, "serializeAlways", void 0);
        it('Respects @Serializable.serialize and @Serializable.deserialize serialization configuration', () => {
            const instance = (new LimitedTest()).initialize(), serialized = internals_1._serialize(instance, 'object'), serializedCloned = Object.assign({}, serialized);
            serializedCloned.serializeNever = 'changed';
            serializedCloned.serializeSerOnly = 'changed';
            serializedCloned.serializeDeSerOnly = 'changed';
            serializedCloned.serializeAlways = 'changed';
            const deserialized = internals_1._deserialize(serializedCloned, 'object', { target: new LimitedTest() });
            tests_init_1.assert(serialized.serializeNever === undefined);
            tests_init_1.assert(serialized.serializeSerOnly !== undefined);
            tests_init_1.assert(serialized.serializeDeSerOnly === undefined);
            tests_init_1.assert(serialized.serializeAlways !== undefined);
            tests_init_1.assert(deserialized.serializeNever === undefined);
            tests_init_1.assert(deserialized.serializeSerOnly === undefined);
            tests_init_1.assert(deserialized.serializeDeSerOnly !== undefined);
            tests_init_1.assert(deserialized.serializeAlways !== undefined);
        });
    });
});
/**
 * Verify serialization
 * @param obj Object instance to be tested
 * @param type Serialization target type
 * @param skipDeserializeCheck If true, comparison between original instance and deserialized instance will be skipped
 * @returns Serialized and deserialized representations of original object: { serialized, deserialized, reserialized }
 */
function verifySerialization(obj, type = 'object', { skipDeserializeCheck = false } = {}) {
    // Serializable and deserialize and reserialize
    const serialized = internals_1._serialize(obj, type), deserialized = internals_1._deserialize(serialized, type, { target: (obj.constructor ? new (obj.constructor)() : {}) }), reserialized = internals_1._serialize(deserialized, type);
    // Check if serialized and deserialized have correct types
    tests_init_1.assert(!(serialized instanceof __1.EnTT));
    tests_init_1.assert(deserialized instanceof obj.constructor);
    tests_init_1.assert(!(reserialized instanceof __1.EnTT));
    // Check if serialized and reserialized didn't lose data
    expect(serialized).toEqual(reserialized);
    // If original object was constructable, check if original object is same as deserialized one
    if (obj.constructor && (obj.constructor !== Object) && !skipDeserializeCheck) {
        expect(obj).toEqual(deserialized);
    }
    // Return serialized, deserialized and reserialized for more processing
    return { serialized, deserialized, reserialized };
}
/**
 * Verify plain object, array of primitive value
 * @param original Object being compared to
 * @param exported Object being compared
 * @param verifyConstructors If constructors should be verified as same (instances of same class)
 * @params ignoreKeys Array of properties which are to be omitted from comparison
 */
function verifyAny(original, exported, { verifyConstructors = false, ignoreKeys = [] } = {}) {
    // Check if object or array
    if (original instanceof Array || original instanceof Object) {
        // Arrays and objects aren't copied by reference
        tests_init_1.assert(exported !== original);
        // Compare object or array members
        for (const key of Object.keys(original)) {
            if (ignoreKeys.indexOf(key) === -1) {
                // Verify members' value match
                verifyAny(original[key], exported[key]);
                // If not checking method
                if ((typeof original[key] !== 'function') && (typeof exported[key] !== 'function')) {
                    // Verify members' types match (unless one is a method)
                    tests_init_1.assert(typeof original[key] === typeof exported[key]);
                    // Verify members' constructors
                    if (verifyConstructors && (original[key] || exported[key])) {
                        tests_init_1.assert(original[key].constructor === exported[key].constructor);
                    }
                }
            }
        }
    }
    else {
        // Primitives are copied and equal
        tests_init_1.assert(exported === original);
    }
}
//# sourceMappingURL=index.spec.js.map