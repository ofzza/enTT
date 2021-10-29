// enTT lib @Serializable decorator tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { EnTT, Property, Serializable } from '../../../';
import { _rawDataType, _cast, _clone, _serialize, _deserialize } from './internals';

// Test ...
describe('@Serializable', () => {
  // Initialize test data models
  const obj = {
    a: undefined as string,
    false: undefined as boolean,
    null: undefined as any,
    undefined: undefined as any,

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    initialize() {
      this.a = 'A';
      this.false = false;
      this.null = null;
      this.undefined = undefined;
      return this;
    },
  };

  class InnerNonEnTT {
    public w?: string = undefined;
    public false?: boolean = undefined;
    public null?: any = undefined;
    public undefined?: any = undefined;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    public initialize() {
      this.w = 'W';
      this.false = false;
      this.null = null;
      this.undefined = undefined;
      return this;
    }
  }

  class NonEnTT {
    public z?: string = undefined;

    @Serializable({ cast: InnerNonEnTT })
    public innernonentity?: InnerNonEnTT = undefined;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    public initialize() {
      this.z = 'Z';
      this.innernonentity = new InnerNonEnTT().initialize();
      return this;
    }
  }

  class InnerMostTest extends EnTT {
    constructor() {
      super();
      super.entt();
    }

    public y: string = undefined;

    @Serializable({ cast: NonEnTT })
    public nonentity?: NonEnTT = undefined;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    public initialize() {
      this.y = 'Y';
      this.nonentity = new NonEnTT().initialize();
      return this;
    }
  }

  class InnerTest extends EnTT {
    constructor() {
      super();
      super.entt();
    }

    public x?: string = undefined;

    @Serializable({ cast: InnerMostTest })
    public innermost?: InnerMostTest = undefined;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    public initialize() {
      this.x = 'X';
      this.innermost = new InnerMostTest().initialize();
      return this;
    }
  }

  class Test extends EnTT {
    constructor() {
      super();
      super.entt();
    }

    public null = null;
    public undefined = undefined;
    public boolean = false;
    public number = 1.234;
    public string = 'abcde';
    public array = [1, 2, 3, 4];
    public object = { a: 1, b: 2, c: 3 };

    @Serializable({ alias: 'aliased' })
    public notaliased?: string = undefined;

    @Serializable({ cast: InnerTest })
    public enttsingle?: InnerTest = undefined;

    @Serializable({ cast: () => InnerTest })
    public enttsinglefactory?: InnerTest = undefined;

    @Serializable({ cast: [InnerTest] })
    public enttarrayliteral?: InnerTest[] = undefined;

    @Serializable({ cast: () => [InnerTest] })
    public enttarrayliteralfactory?: InnerTest[] = undefined;

    @Serializable({ cast: { InnerTest } })
    public enttobjectliteral?: any = undefined;

    @Serializable({ cast: () => ({ InnerTest }) })
    public enttobjectliteralfactory?: any = undefined;

    @Property({ enumerable: false })
    public nonenumerable?: string = undefined;

    @Property({ set: false })
    public getteronly = 'getteronly';

    @Property({ get: false })
    public setteronly: string = undefined;

    @Property({ get: (value, instance) => `${instance.nonenumerable}:${value && value.toUpperCase()}` })
    public customgetter: string = undefined;

    @Property({ set: (value, instance) => `${instance.nonenumerable}:${value && value.toUpperCase()}` })
    public customsetter: string = undefined;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    public initialize() {
      this.notaliased = '(not)aliased';
      this.enttsingle = new InnerTest().initialize();
      this.enttsinglefactory = new InnerTest().initialize();
      this.enttarrayliteral = [new InnerTest().initialize(), new InnerTest().initialize(), new InnerTest().initialize()];
      this.enttarrayliteralfactory = [new InnerTest().initialize(), new InnerTest().initialize(), new InnerTest().initialize()];
      this.enttobjectliteral = { a: new InnerTest().initialize(), b: new InnerTest().initialize(), c: new InnerTest().initialize() };
      this.enttobjectliteralfactory = { a: new InnerTest().initialize(), b: new InnerTest().initialize(), c: new InnerTest().initialize() };
      this.nonenumerable = 'nonenumerable';
      this.setteronly = 'setteronly';
      this.customgetter = 'customgetter';
      this.customsetter = 'customsetter';
      return this;
    }
  }

  class ExtendedTestEntity extends Test {
    constructor() {
      super();
      super.entt();
    }

    @Serializable({ serialize: false })
    public dontserialize: string = undefined;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    public initialize() {
      super.initialize();
      this.dontserialize = 'dontserialize';
      return this;
    }
  }

  // Run tests
  describe('Works with non-EnTT objects', () => {
    it('Serializes and Deserializes raw objects', () => {
      const instance = obj.initialize(),
        { serialized, deserialized, reserialized } = verifySerialization(instance);
      verifyAny(instance, serialized, { verifyConstructors: false });
      verifyAny(instance, reserialized, { verifyConstructors: false });
      verifyAny(instance, deserialized, { verifyConstructors: true });
    });

    it('Casts as Objects', () => {
      const instance = obj.initialize(),
        { serialized, deserialized } = verifySerialization(instance),
        castSingle = _cast(Object)(serialized),
        castArray = _cast<object>([Object])([serialized, serialized, serialized]),
        castHashmap = _cast<object>({ Object })({ a: serialized, b: serialized, c: serialized });
      verifyAny(castSingle, instance, { verifyConstructors: true });
      verifyAny(castSingle, deserialized, { verifyConstructors: true });
      assert(castArray instanceof Array);
      assert(castArray.length === 3);
      verifyAny(castArray[0], instance, { verifyConstructors: true });
      verifyAny(castArray[0], deserialized, { verifyConstructors: true });
      assert(castHashmap instanceof Object);
      assert(Object.keys(castHashmap).length === 3);
      verifyAny(castHashmap.a, instance, { verifyConstructors: true });
      verifyAny(castHashmap.a, deserialized, { verifyConstructors: true });
    });

    it('Clones raw objects', () => {
      const instance = obj.initialize(),
        cloned = EnTT.clone(instance);
      assert(instance !== cloned);
      assert(_serialize(instance, 'json') === _serialize(cloned, 'json'));
    });
  });

  describe('Works with non-EnTT class instances', () => {
    it('Serializes and Deserializes non-EnTT class instances', () => {
      const instance = new NonEnTT().initialize(),
        { serialized, deserialized, reserialized } = verifySerialization(instance);
      verifyAny(instance, serialized, { verifyConstructors: false });
      verifyAny(instance, reserialized, { verifyConstructors: false });
      verifyAny(instance, deserialized, { verifyConstructors: true });
    });

    it('Casts as non-EnTTs', () => {
      const instance = new NonEnTT().initialize(),
        { serialized, deserialized } = verifySerialization(instance),
        castSingle = _cast(NonEnTT)(serialized),
        castArray = _cast<object>([NonEnTT])([serialized, serialized, serialized]),
        castHashmap = _cast<object>({ NonEnTT })({ a: serialized, b: serialized, c: serialized });
      verifyAny(castSingle, instance, { verifyConstructors: true });
      verifyAny(castSingle, deserialized, { verifyConstructors: true });
      assert(castArray instanceof Array);
      assert(castArray.length === 3);
      verifyAny(castArray[0], instance, { verifyConstructors: true });
      verifyAny(castArray[0], deserialized, { verifyConstructors: true });
      assert(castHashmap instanceof Object);
      assert(Object.keys(castHashmap).length === 3);
      verifyAny(castHashmap.a, instance, { verifyConstructors: true });
      verifyAny(castHashmap.a, deserialized, { verifyConstructors: true });
    });

    it('Clones non-EnTT class instances', () => {
      const instance = new NonEnTT().initialize(),
        cloned = EnTT.clone(instance);
      assert(instance !== cloned);
      assert(_serialize(instance, 'json') === _serialize(cloned, 'json'));
    });
  });

  describe('Works with EnTT class instances', () => {
    it('Serializes and Deserializes EnTT class instances', () => {
      const instance = new Test().initialize(),
        ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
        { serialized, deserialized, reserialized } = verifySerialization(instance);
      verifyAny(instance, serialized, { verifyConstructors: false, ignoreKeys });
      verifyAny(instance, reserialized, { verifyConstructors: false, ignoreKeys });
      verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });

      const serializedDirectly = instance.serialize('object'),
        serializedIndirectly = _serialize(instance, 'object');
      expect(serializedDirectly).toEqual(serializedIndirectly);

      const deserializedDirectly = instance.deserialize(serializedDirectly, 'object'),
        deserializedIndirectly = _deserialize(serializedIndirectly, 'object', { target: new Test() });
      expect(deserializedDirectly).toEqual(deserializedIndirectly);
    });

    it('Casts as EnTTs', () => {
      const instance = new Test().initialize(),
        ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
        { serialized, deserialized } = verifySerialization(instance),
        castSingle = _cast(Test)(serialized),
        castArray = _cast<object>([Test])([serialized, serialized, serialized]),
        castHashmap = _cast<object>({ Test })({ a: serialized, b: serialized, c: serialized });
      verifyAny(castSingle, instance, { verifyConstructors: true, ignoreKeys });
      verifyAny(castSingle, deserialized, { verifyConstructors: true, ignoreKeys });
      assert(castArray instanceof Array);
      assert(castArray.length === 3);
      verifyAny(castArray[0], instance, { verifyConstructors: true });
      verifyAny(castArray[0], deserialized, { verifyConstructors: true });
      assert(castHashmap instanceof Object);
      assert(Object.keys(castHashmap).length === 3);
      verifyAny(castHashmap.a, instance, { verifyConstructors: true });
      verifyAny(castHashmap.a, deserialized, { verifyConstructors: true });

      const castExplicitlyDirectly = Test.cast(serialized, { into: Test }),
        castExplicitlyViaEnTT = EnTT.cast(serialized, { into: Test }),
        castImplicitlyDirectly = Test.cast(serialized),
        castIndirectly = _cast(Test)(serialized);
      expect(instance).toEqual(castExplicitlyDirectly);
      expect(instance).toEqual(castExplicitlyViaEnTT);
      expect(instance).toEqual(castImplicitlyDirectly);
      expect(instance).toEqual(castIndirectly);

      const castExplicitlyDirectlyArray = Test.cast([serialized], { into: [Test] }),
        castExplicitlyViaEnTTArray = EnTT.cast([serialized], { into: [Test] });
      expect(instance).toEqual(castExplicitlyDirectlyArray[0]);
      expect(instance).toEqual(castExplicitlyViaEnTTArray[0]);

      const castExplicitlyDirectlyHashmap = Test.cast({ a: serialized }, { into: { Test } }),
        castExplicitlyViaEnTTHashmap = EnTT.cast({ a: serialized }, { into: { Test } });
      expect(instance).toEqual(castExplicitlyDirectlyHashmap.a);
      expect(instance).toEqual(castExplicitlyViaEnTTHashmap.a);
    });

    it('Clones EnTT class instances', () => {
      const instance = new Test().initialize(),
        cloned = EnTT.clone(instance);
      assert(instance !== cloned);
      assert(_serialize(instance, 'json') === _serialize(cloned, 'json'));
    });
  });

  describe('Works with extended EnTT class instances', () => {
    it('Serializes and Deserializes extended EnTT class instances', () => {
      const instance = new ExtendedTestEntity().initialize(),
        ignoreKeys = ['dontserialize', 'notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
        { serialized, deserialized, reserialized } = verifySerialization(instance, 'object', { skipDeserializeCheck: true });
      verifyAny(instance, serialized, { verifyConstructors: false, ignoreKeys });
      verifyAny(instance, reserialized, { verifyConstructors: false, ignoreKeys });
      verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });

      const serializedDirectly = instance.serialize('object'),
        serializedIndirectly = _serialize(instance, 'object');
      expect(serializedDirectly).toEqual(serializedIndirectly);
    });
  });

  describe('Works with multiple serialization target types', () => {
    it('Works with JS object target', () => {
      const instance = new Test().initialize(),
        ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
        serialized = _serialize(instance, 'object'),
        deserialized = _deserialize(serialized, 'object', { target: new Test() });
      verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
      assert(typeof serialized === 'object');
    });

    it('Works with JSON target', () => {
      const instance = new Test().initialize(),
        ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
        serialized = _serialize(instance, 'json'),
        deserialized = _deserialize(serialized, 'json', { target: new Test() });
      verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
      assert(typeof serialized === 'string');
    });
  });

  it('Allows overriding when extending EnTT classes', () => {
    class Inner extends EnTT {
      constructor() {
        super();
        super.entt();
      }
      public prop = true;
    }

    class TestBase extends EnTT {
      constructor() {
        super();
        super.entt();
      }

      @Serializable({ serialize: false, deserialize: false })
      public propA = true;

      @Serializable({ alias: 'propB1', cast: Inner })
      public propB: any = undefined;
    }

    class TestExtended extends TestBase {
      constructor() {
        super();
        super.entt();
      }

      @Serializable({ serialize: true, deserialize: true })
      public propA = true;

      @Serializable({ alias: 'propB2', cast: [Inner] })
      public propB: any = undefined;
    }

    const base = new TestBase();
    base.deserialize({ propA: false, propB1: { prop: true } });
    assert(base.propA === true);
    assert(base.propB instanceof Inner);
    assert(base.propB.prop === true);

    const test = new TestExtended();
    test.deserialize({ propA: false, propB2: [{ prop: true }, { prop: false }] });
    assert(test.propA === false);
    assert(test.propB instanceof Array);
    assert(test.propB.length === 2);
    assert(test.propB[0].prop === true);
    assert(test.propB[1].prop === false);
  });

  describe('Respects limiting or opting out of serialization', () => {
    class LimitedTest extends EnTT {
      constructor() {
        super();
        super.entt();
      }

      @Serializable({ serialize: false, deserialize: false })
      public serializeNever: string = undefined;
      @Serializable({ serialize: true, deserialize: false })
      public serializeSerOnly: string = undefined;
      @Serializable({ serialize: false, deserialize: true })
      public serializeDeSerOnly: string = undefined;
      @Serializable({ serialize: true, deserialize: true })
      public serializeAlways: string = undefined;

      public initialize() {
        this.serializeNever = 'initialized';
        this.serializeSerOnly = 'initialized';
        this.serializeDeSerOnly = 'initialized';
        this.serializeAlways = 'initialized';
        return this;
      }
    }

    it('Respects @Serializable.serialize and @Serializable.deserialize serialization configuration', () => {
      const instance = new LimitedTest().initialize(),
        serialized = _serialize(instance, 'object'),
        serializedCloned = { ...serialized };
      serializedCloned.serializeNever = 'changed';
      serializedCloned.serializeSerOnly = 'changed';
      serializedCloned.serializeDeSerOnly = 'changed';
      serializedCloned.serializeAlways = 'changed';
      const deserialized = _deserialize(serializedCloned, 'object', { target: new LimitedTest() });

      assert(serialized.serializeNever === undefined);
      assert(serialized.serializeSerOnly !== undefined);
      assert(serialized.serializeDeSerOnly === undefined);
      assert(serialized.serializeAlways !== undefined);
      assert(deserialized.serializeNever === undefined);
      assert(deserialized.serializeSerOnly === undefined);
      assert(deserialized.serializeDeSerOnly !== undefined);
      assert(deserialized.serializeAlways !== undefined);
    });

    it('Allows opting out of post-processing validation', () => {
      // TODO: deserialize
      // TODO: cast
      // TODO: clone
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
function verifySerialization(obj, type = 'object' as _rawDataType, { skipDeserializeCheck = false } = {}) {
  // Serializable and deserialize and reserialize
  const serialized = _serialize(obj, type),
    deserialized = _deserialize(serialized, type, { target: obj.constructor ? new obj.constructor() : {} }),
    reserialized = _serialize(deserialized, type);

  // Check if serialized and deserialized have correct types
  assert(!(serialized instanceof EnTT));
  assert(deserialized instanceof obj.constructor);
  assert(!(reserialized instanceof EnTT));

  // Check if serialized and reserialized didn't lose data
  expect(serialized).toEqual(reserialized);
  // If original object was constructable, check if original object is same as deserialized one
  if (obj.constructor && obj.constructor !== Object && !skipDeserializeCheck) {
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
  // Arrays and objects aren't copied by reference
  if (original instanceof Array || original instanceof Object) {
    assert(exported !== original);

    // Compare object or array members
    for (const key of Object.keys(original)) {
      if (ignoreKeys.indexOf(key) === -1) {
        // Verify members' value match
        verifyAny(original[key], exported[key]);

        // If not checking method
        if (typeof original[key] !== 'function' && typeof exported[key] !== 'function') {
          // Verify members' types match (unless one is a method)
          assert(typeof original[key] === typeof exported[key]);

          // Verify members' constructors
          if (verifyConstructors && (original[key] || exported[key])) {
            assert(original[key].constructor === exported[key].constructor);
          }
        }
      }
    }
  }

  // Primitives are copied and equal
  else {
    assert(exported === original);
  }
}
