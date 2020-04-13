"use strict";
// README.md file examples' tests
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// Import dependencies
const tests_init_1 = require("./tests.init");
const _1 = require("./");
// Import validation providers
const Joi = tslib_1.__importStar(require("@hapi/joi"));
const Yup = tslib_1.__importStar(require("yup"));
// Test ...
describe('README examples', () => {
    describe('Using @Property decorator', () => {
        describe('Enumerable', () => {
            it('Example', () => {
                class MyEntityClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.standard = 'default';
                        this.enumerable = 'enumerable';
                        this.nonenumerable = 'nonenumerable';
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Property({ enumerable: true }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "standard", void 0);
                tslib_1.__decorate([
                    _1.Property({ enumerable: true }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "enumerable", void 0);
                tslib_1.__decorate([
                    _1.Property({ enumerable: false }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "nonenumerable", void 0);
                const instance = new MyEntityClass();
                tests_init_1.assert(Object.keys(instance).join('|') === ['standard', 'enumerable'].join('|'));
            });
        });
        describe('Read-only / Write-only', () => {
            it('Example', () => {
                class MyEntityClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.readonly = 'readonly';
                        this.writeonly = 'writeonly';
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Property({ set: false }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "readonly", void 0);
                tslib_1.__decorate([
                    _1.Property({ get: false }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "writeonly", void 0);
                const instance = new MyEntityClass();
                expect(() => { instance.readonly = 'value'; }).toThrow();
                tests_init_1.assert(instance.readonly === 'readonly');
                tests_init_1.assert((instance.writeonly = 'writeonly') === 'writeonly');
                tests_init_1.assert(instance.writeonly === undefined);
            });
        });
        describe('Custom getter and/or setter', () => {
            it('Example', () => {
                function toTitleCase(value) {
                    return (value && value[0] ? value[0].toUpperCase() + value.substr(1) : value);
                }
                class MyEntityClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.firstName = undefined;
                        this.lastName = undefined;
                        this.fullName = undefined;
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Property({ set: (obj, value) => toTitleCase(value) }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "firstName", void 0);
                tslib_1.__decorate([
                    _1.Property({ set: (obj, value) => toTitleCase(value) }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "lastName", void 0);
                tslib_1.__decorate([
                    _1.Property({ get: (obj, value) => `${obj.firstName} ${obj.lastName}` }),
                    tslib_1.__metadata("design:type", Object)
                ], MyEntityClass.prototype, "fullName", void 0);
                const instance = new MyEntityClass();
                instance.firstName = 'john';
                tests_init_1.assert(instance.firstName === 'John');
                instance.lastName = 'doe';
                tests_init_1.assert(instance.lastName === 'Doe');
                tests_init_1.assert(instance.fullName === 'John Doe');
            });
        });
    });
    describe('Using @Serializable decorator', () => {
        describe('Simply serialize, deserialize and cast', () => {
            it('Example', () => {
                class MyPersonClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.firstName = undefined;
                        this.lastName = undefined;
                        super.entt();
                    }
                }
                const instance = new MyPersonClass();
                instance.firstName = 'John';
                instance.lastName = 'Doe';
                const serialized = instance.serialize();
                tests_init_1.assert(JSON.stringify(serialized) === JSON.stringify({ firstName: "John", lastName: "Doe" }));
                const deserialized = new MyPersonClass();
                deserialized.deserialize(serialized);
                tests_init_1.assert(deserialized.firstName === 'John');
                tests_init_1.assert(deserialized.lastName === 'Doe');
                const castSingle = MyPersonClass.cast(serialized);
                tests_init_1.assert(castSingle instanceof MyPersonClass);
                tests_init_1.assert(castSingle.firstName === 'John');
                tests_init_1.assert(castSingle.lastName === 'Doe');
                const castArray = MyPersonClass.cast([serialized, serialized, serialized], { into: [MyPersonClass] });
                tests_init_1.assert(castArray[0] instanceof MyPersonClass);
                tests_init_1.assert(castArray[0].firstName === 'John');
                tests_init_1.assert(castArray[0].lastName === 'Doe');
                const castHashmap = MyPersonClass.cast({ a: serialized, b: serialized, c: serialized }, { into: { MyPersonClass } });
                tests_init_1.assert(castHashmap.a instanceof MyPersonClass);
                tests_init_1.assert(castHashmap.a.firstName === 'John');
                tests_init_1.assert(castHashmap.a.lastName === 'Doe');
                MyPersonClass.cast(Promise.resolve(serialized)).then((castPromise) => {
                    tests_init_1.assert(castPromise instanceof MyPersonClass);
                    tests_init_1.assert(castPromise.firstName === 'John');
                    tests_init_1.assert(castPromise.lastName === 'Doe');
                });
            });
        });
        describe('Aliasing property names', () => {
            it('Example', () => {
                class MyPersonClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.firstName = undefined;
                        this.lastName = undefined;
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Serializable({ alias: 'first_name' }),
                    tslib_1.__metadata("design:type", Object)
                ], MyPersonClass.prototype, "firstName", void 0);
                tslib_1.__decorate([
                    _1.Serializable({ alias: 'last_name' }),
                    tslib_1.__metadata("design:type", Object)
                ], MyPersonClass.prototype, "lastName", void 0);
                const instance = new MyPersonClass();
                instance.firstName = 'John';
                instance.lastName = 'Doe';
                const serialized = instance.serialize();
                tests_init_1.assert(JSON.stringify(serialized) === JSON.stringify({ first_name: "John", last_name: "Doe" }));
                const deserialized = new MyPersonClass();
                deserialized.deserialize(serialized);
                tests_init_1.assert(deserialized.firstName === 'John');
                tests_init_1.assert(deserialized.lastName === 'Doe');
                const cast = MyPersonClass.cast(serialized);
                tests_init_1.assert(cast.firstName === 'John');
                tests_init_1.assert(cast.lastName === 'Doe');
            });
        });
        describe('Not-Serializable properties', () => {
            it('Example', () => {
                class MyAuthenticationClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.password = undefined;
                        this.repeatPassword = undefined;
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Serializable({ serialize: true }),
                    tslib_1.__metadata("design:type", Object)
                ], MyAuthenticationClass.prototype, "password", void 0);
                tslib_1.__decorate([
                    _1.Serializable({ serialize: false }),
                    tslib_1.__metadata("design:type", Object)
                ], MyAuthenticationClass.prototype, "repeatPassword", void 0);
                const instance = new MyAuthenticationClass();
                instance.password = '123';
                instance.repeatPassword = '123';
                const serialized = instance.serialize();
                tests_init_1.assert(JSON.stringify(serialized) === JSON.stringify({ password: "123" }));
                const deserialized = new MyAuthenticationClass();
                deserialized.deserialize(Object.assign(Object.assign({}, serialized), { repeatPassword: '123' }));
                tests_init_1.assert(deserialized.password === '123');
                tests_init_1.assert(deserialized.repeatPassword === undefined);
                const cast = MyAuthenticationClass.cast(serialized);
                tests_init_1.assert(deserialized.password === '123');
                tests_init_1.assert(deserialized.repeatPassword === undefined);
            });
        });
        describe('Preserving nested class instances', () => {
            it('Example', () => {
                class MyPersonClass extends _1.EnTT {
                    constructor(name) {
                        super();
                        this.name = undefined;
                        this.spouse = undefined;
                        this.siblings = [];
                        this.parents = {
                            mother: undefined,
                            father: undefined
                        };
                        super.entt();
                        this.name = name;
                    }
                }
                tslib_1.__decorate([
                    _1.Serializable({ cast: MyPersonClass }),
                    tslib_1.__metadata("design:type", Object)
                ], MyPersonClass.prototype, "spouse", void 0);
                tslib_1.__decorate([
                    _1.Serializable({ cast: [MyPersonClass] }),
                    tslib_1.__metadata("design:type", Object)
                ], MyPersonClass.prototype, "siblings", void 0);
                tslib_1.__decorate([
                    _1.Serializable({ cast: { MyPersonClass } }),
                    tslib_1.__metadata("design:type", Object)
                ], MyPersonClass.prototype, "parents", void 0);
                const person = new MyPersonClass('John Doe');
                person.spouse = new MyPersonClass('Joanna Doe');
                person.siblings.push(new MyPersonClass('Jo Doe'), new MyPersonClass('Johnny Doe'), new MyPersonClass('Jay Doe'));
                person.parents.mother = new MyPersonClass('Joanna Doe Sr.');
                person.parents.father = new MyPersonClass('John Doe Sr.');
                const serialized = person.serialize();
                tests_init_1.assert(JSON.stringify(serialized) === JSON.stringify({
                    name: "John Doe",
                    spouse: {
                        name: "Joanna Doe",
                        siblings: [],
                        parents: {}
                    },
                    siblings: [
                        {
                            name: "Jo Doe",
                            siblings: [],
                            parents: {}
                        },
                        {
                            name: "Johnny Doe",
                            siblings: [],
                            parents: {}
                        },
                        {
                            name: "Jay Doe",
                            siblings: [],
                            parents: {}
                        }
                    ],
                    parents: {
                        mother: {
                            name: "Joanna Doe Sr.",
                            siblings: [],
                            parents: {}
                        },
                        father: {
                            name: "John Doe Sr.",
                            siblings: [],
                            parents: {}
                        }
                    }
                }));
                const deserialized = new MyPersonClass();
                deserialized.deserialize(serialized);
                tests_init_1.assert(deserialized instanceof MyPersonClass);
                tests_init_1.assert(deserialized.spouse instanceof MyPersonClass);
                tests_init_1.assert(deserialized.siblings[0] instanceof MyPersonClass);
                tests_init_1.assert(deserialized.siblings[1] instanceof MyPersonClass);
                tests_init_1.assert(deserialized.siblings[2] instanceof MyPersonClass);
                tests_init_1.assert(deserialized.parents.mother instanceof MyPersonClass);
                tests_init_1.assert(deserialized.parents.father instanceof MyPersonClass);
                const cast = MyPersonClass.cast(serialized);
                tests_init_1.assert(cast instanceof MyPersonClass);
                tests_init_1.assert(cast.spouse instanceof MyPersonClass);
                tests_init_1.assert(cast.siblings[0] instanceof MyPersonClass);
                tests_init_1.assert(cast.siblings[1] instanceof MyPersonClass);
                tests_init_1.assert(cast.siblings[2] instanceof MyPersonClass);
                tests_init_1.assert(cast.parents.mother instanceof MyPersonClass);
                tests_init_1.assert(cast.parents.father instanceof MyPersonClass);
            });
        });
    });
    describe('Using @Validate decorator', () => {
        describe('Validate by data type', () => {
            it('Example', () => {
                class MyValidClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.aBoolean = false;
                        this.aNumber = 123;
                        this.aString = 'abc';
                        this.anObject = {};
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Validate({ type: 'boolean' }),
                    tslib_1.__metadata("design:type", Object)
                ], MyValidClass.prototype, "aBoolean", void 0);
                tslib_1.__decorate([
                    _1.Validate({ type: 'number' }),
                    tslib_1.__metadata("design:type", Object)
                ], MyValidClass.prototype, "aNumber", void 0);
                tslib_1.__decorate([
                    _1.Validate({ type: 'string' }),
                    tslib_1.__metadata("design:type", Object)
                ], MyValidClass.prototype, "aString", void 0);
                tslib_1.__decorate([
                    _1.Validate({ type: 'object' }),
                    tslib_1.__metadata("design:type", Object)
                ], MyValidClass.prototype, "anObject", void 0);
                const instance = new MyValidClass();
                tests_init_1.assert(instance.valid === true);
                tests_init_1.assert(Object.keys(instance.errors).length === 0);
                instance.aBoolean = undefined;
                instance.aNumber = undefined;
                instance.aString = undefined;
                instance.anObject = undefined;
                tests_init_1.assert(instance.valid === false);
                tests_init_1.assert(Object.keys(instance.errors).length === 4);
                tests_init_1.assert(instance.errors['aBoolean'].length === 1);
                tests_init_1.assert(instance.errors['aNumber'].length === 1);
                tests_init_1.assert(instance.errors['aString'].length === 1);
                tests_init_1.assert(instance.errors['anObject'].length === 1);
            });
        });
        describe('Validate using a custom validator', () => {
            describe('Custom validator function', () => {
                it('Example', () => {
                    class MyDatesClass extends _1.EnTT {
                        constructor() {
                            super();
                            // Validate year is within a predefined scope
                            this.born = undefined;
                            // Validate year is within dynamic scope and throw custom validation errors
                            this.graduated = undefined;
                            super.entt();
                        }
                    }
                    tslib_1.__decorate([
                        _1.Validate({ provider: (obj, value) => (value > 1900) && (value < 2100) }),
                        tslib_1.__metadata("design:type", Object)
                    ], MyDatesClass.prototype, "born", void 0);
                    tslib_1.__decorate([
                        _1.Validate({
                            provider: (obj, value) => {
                                const errs = [];
                                if (value < obj.born) {
                                    errs.push(new _1.EnttValidationError({
                                        type: 'custom',
                                        message: 'Graduation year must be greater than birth date!',
                                        context: {}
                                    }));
                                }
                                if (value >= obj.born) {
                                    errs.push(new _1.EnttValidationError({
                                        type: 'custom',
                                        message: 'Graduation year must be smaller than 2100!',
                                        context: {}
                                    }));
                                }
                                return errs;
                            }
                        }),
                        tslib_1.__metadata("design:type", Object)
                    ], MyDatesClass.prototype, "graduated", void 0);
                    const instance = new MyDatesClass();
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(Object.keys(instance.errors).length === 1);
                    tests_init_1.assert(instance.errors['born'].length === 1);
                    instance.born = 1800;
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(instance.errors['born'].length === 1);
                    instance.born = 1950;
                    instance.graduated = 1949;
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(instance.errors['graduated'].length === 1);
                    tests_init_1.assert(instance.errors['graduated'][0].type === 'custom');
                });
            });
            describe('JOI validator', () => {
                it('Example', () => {
                    class MyDatesClass extends _1.EnTT {
                        constructor() {
                            super();
                            // Validate year is within a predefined scope
                            this.born = undefined;
                            // Validate year is within dynamic scope and throw custom validation errors
                            this.graduated = undefined;
                            super.entt();
                        }
                    }
                    tslib_1.__decorate([
                        _1.Validate({ provider: Joi.number().strict().integer().min(1900).max(2100).required() }),
                        tslib_1.__metadata("design:type", Object)
                    ], MyDatesClass.prototype, "born", void 0);
                    tslib_1.__decorate([
                        _1.Validate({ provider: Joi.number().strict().integer().min(Joi.ref('$.born')).max(2100).required() }),
                        tslib_1.__metadata("design:type", Object)
                    ], MyDatesClass.prototype, "graduated", void 0);
                    const instance = new MyDatesClass();
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(Object.keys(instance.errors).length === 2);
                    tests_init_1.assert(instance.errors['born'].length === 1);
                    tests_init_1.assert(instance.errors['graduated'].length === 1);
                    instance.born = 1800;
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(Object.keys(instance.errors).length === 2);
                    tests_init_1.assert(instance.errors['born'].length === 1);
                    tests_init_1.assert(instance.errors['graduated'].length === 1);
                    instance.born = 1950;
                    instance.graduated = 1949;
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(Object.keys(instance.errors).length === 1);
                    tests_init_1.assert(instance.errors['graduated'].length === 1);
                });
            });
            describe('YUP validator', () => {
                it('Example', () => {
                    class MyDatesClass extends _1.EnTT {
                        constructor() {
                            super();
                            // Validate year is within a predefined scope
                            this.born = undefined;
                            // Validate year is within dynamic scope and throw custom validation errors
                            this.graduated = undefined;
                            super.entt();
                        }
                    }
                    tslib_1.__decorate([
                        _1.Validate({ provider: Yup.number().strict().integer().min(1900).max(2100).required() }),
                        tslib_1.__metadata("design:type", Object)
                    ], MyDatesClass.prototype, "born", void 0);
                    tslib_1.__decorate([
                        _1.Validate({ provider: Yup.number().strict().integer().min(Yup.ref('$.born')).max(2100).required() }),
                        tslib_1.__metadata("design:type", Object)
                    ], MyDatesClass.prototype, "graduated", void 0);
                    const instance = new MyDatesClass();
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(Object.keys(instance.errors).length === 2);
                    tests_init_1.assert(instance.errors['born'].length === 1);
                    tests_init_1.assert(instance.errors['graduated'].length === 1);
                    instance.born = 1800;
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(Object.keys(instance.errors).length === 2);
                    tests_init_1.assert(instance.errors['born'].length === 1);
                    tests_init_1.assert(instance.errors['graduated'].length === 1);
                    instance.born = 1950;
                    instance.graduated = 1949;
                    tests_init_1.assert(instance.valid === false);
                    tests_init_1.assert(Object.keys(instance.errors).length === 1);
                    tests_init_1.assert(instance.errors['graduated'].length === 1);
                });
            });
        });
        describe('Validating nested class instances', () => {
            it('Example', () => {
                class MyNestedClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.aNumber = undefined;
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Validate({ provider: Yup.number().strict().required() }),
                    tslib_1.__metadata("design:type", Object)
                ], MyNestedClass.prototype, "aNumber", void 0);
                class MyParentClass extends _1.EnTT {
                    constructor() {
                        super();
                        this.aBoolean = undefined;
                        this.nested = new MyNestedClass();
                        super.entt();
                    }
                }
                tslib_1.__decorate([
                    _1.Validate({ provider: Yup.boolean().strict().required() }),
                    tslib_1.__metadata("design:type", Object)
                ], MyParentClass.prototype, "aBoolean", void 0);
                const instance = new MyParentClass();
                instance.aBoolean = 'abc';
                instance.nested.aNumber = 'abc';
                tests_init_1.assert(instance.valid === false);
                tests_init_1.assert(Object.keys(instance.errors).length === 2);
            });
        });
    });
});
//# sourceMappingURL=readme.spec.js.map