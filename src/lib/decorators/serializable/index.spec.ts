// enTT lib @Serializable decorator tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init'
import { EnTT, Property, Serializable }  from '../../../';
import { _rawDataType, _cast, _serialize, _deserialize }  from './';

// Test ...
describe('@Serializable', () => {

  // Initialize test data models
  const obj = {
    a:         undefined as string,
    false:     undefined as boolean,
    null:      undefined as any,
    undefined: undefined as any,

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    initialize () {
      this.a          = 'A';
      this.false      = false;
      this.null       = null;
      this.undefined  = undefined;
      return this;
    }
  }

  class InnerNonEnTT {
    public w         = undefined as string;
    public false     = undefined as boolean;
    public null      = undefined as any;
    public undefined = undefined as any;
   
    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    initialize () {
      this.w          = 'W';
      this.false      = false;
      this.null       = null;
      this.undefined  = undefined;
      return this;
    }
  }

  class NonEnTT {
    public z = undefined as string;

    @Serializable({ cast: InnerNonEnTT })
    public innernonentity = undefined as InnerNonEnTT;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    initialize () {
      this.z              = 'Z';
      this.innernonentity = (new InnerNonEnTT()).initialize();
      return this;
    }
  }

  class InnerMostTest extends EnTT {
    constructor () { super(); super.entt(); }

    public y = undefined as string;

    @Serializable({ cast: NonEnTT })
    public nonentity = undefined as NonEnTT;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    initialize () {
      this.y          = 'Y';
      this.nonentity = (new NonEnTT()).initialize();
      return this;
    }
  }

  class InnerTest extends EnTT {
    constructor () { super(); super.entt(); }

    public x = undefined as string;
    
    @Serializable({ cast: InnerMostTest })
    public innermost = undefined as InnerMostTest;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    initialize () {
      this.x         = 'X';
      this.innermost = (new InnerMostTest()).initialize();
      return this;
    }
  }

  class Test extends EnTT {
    constructor () { super(); super.entt(); }

    public null       = null;
    public undefined  = undefined;
    public boolean    = false;
    public number     = 1.234;
    public string     = 'abcde';
    public array      = [1, 2, 3, 4];
    public object     = { a: 1, b: 2, c: 3 };

    @Serializable({ alias: 'aliased' })
    public notaliased = undefined as string;

    @Serializable({ cast: InnerTest })
    public enttsingle = undefined as InnerTest;

    @Serializable({ cast: [ InnerTest ] })
    public enttarrayliteral = undefined as InnerTest[];

    @Serializable({ cast: { InnerTest } })
    public enttobjectliteral = undefined as any;

    @Property({ enumerable: false })
    public nonenumerable = undefined as string;

    @Property({ set: false })
    public getteronly = 'getteronly' as string;

    @Property({ get: false })
    public setteronly = undefined as string;

    @Property({ get: (obj, value) => `${obj.nonenumerable}:${value && value.toUpperCase()}` })
    public customgetter = undefined as string;

    @Property({ set: (obj, value) => `${obj.nonenumerable}:${value && value.toUpperCase()}` })
    public customsetter = undefined as string;

    // Using post-constructor initialization of values to avoid values already being there on deserialization,
    // preventing a fair check of serialization/deserialization
    initialize () {
      this.notaliased        = '(not)aliased';
      this.enttsingle        = (new InnerTest()).initialize();
      this.enttarrayliteral  = [ (new InnerTest()).initialize(), (new InnerTest()).initialize(), (new InnerTest()).initialize() ];
      this.enttobjectliteral = { a: (new InnerTest()).initialize(), b: (new InnerTest()).initialize(), c: (new InnerTest()).initialize() };
      this.nonenumerable     = 'nonenumerable';
      this.setteronly        = 'setteronly';
      this.customgetter      = 'customgetter';
      this.customsetter      = 'customsetter';
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
            cast = _cast(Object)(serialized);
      verifyAny(cast, instance, { verifyConstructors: true });
      verifyAny(cast, deserialized, { verifyConstructors: true });
    });

  });
  
  describe('Works with non-EnTT class instances', () => {

    it('Serializes and Deserializes non-EnTT class instances', () => {
      const instance = (new NonEnTT()).initialize(),
            { serialized, deserialized, reserialized } = verifySerialization(instance);
      verifyAny(instance, serialized, { verifyConstructors: false });
      verifyAny(instance, reserialized, { verifyConstructors: false });
      verifyAny(instance, deserialized, { verifyConstructors: true });
    });

    it('Casts as non-EnTTs', () => {
      const instance = (new NonEnTT()).initialize(),
            { serialized, deserialized } = verifySerialization(instance),
            cast = _cast(NonEnTT)(serialized);
      verifyAny(cast, instance, { verifyConstructors: true });
      verifyAny(cast, deserialized, { verifyConstructors: true });
    });

  });
  
  describe('Works with EnTT class instances', () => {

    it('Serializes and Deserializes EnTT class instances', () => {
      const instance = (new Test()).initialize(),
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
      const instance = (new Test()).initialize(),
            ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
            { serialized, deserialized } = verifySerialization(instance),
            cast = _cast(Test)(serialized);
      verifyAny(cast, instance, { verifyConstructors: true, ignoreKeys });
      verifyAny(cast, deserialized, { verifyConstructors: true, ignoreKeys });

      const castExplicitlyDirectly = Test.cast(serialized, 'object', { Class: Test }),
            castImplicitlyDirectly = Test.cast(serialized, 'object'),
            castIndirectly = _cast(Test)(serialized);
      expect(instance).toEqual(castExplicitlyDirectly);            
      expect(instance).toEqual(castImplicitlyDirectly);            
      expect(instance).toEqual(castIndirectly);            
    });

  });

  describe('Works with multiple serialization target types', () => {

    it('Works with JS object target', () => {
      const instance = (new Test()).initialize(),
            ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
            serialized = _serialize(instance, 'object'),
            deserialized = _deserialize(serialized, 'object', { target: new Test() });
      verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
      assert(typeof serialized === 'object');
    });

    it('Works with JSON target', () => {
      const instance = (new Test()).initialize(),
            ignoreKeys = ['notaliased', 'aliased', 'getteronly', 'setteronly', 'customgetter', 'customsetter'],
            serialized = _serialize(instance, 'json'),
            deserialized = _deserialize(serialized, 'json', { target: new Test() });
      verifyAny(instance, deserialized, { verifyConstructors: true, ignoreKeys });
      assert(typeof serialized === 'string');
    });

  });

});

/**
 * Verify serialization
 * @param obj Object instance to be tested
 * @param type Serialization target type
 * @returns Serialized and deserialized representations of original object: { serialized, deserialized, reserialized }
 */
function verifySerialization (obj, type = 'object' as _rawDataType) {
  // Serializable and deserialize and reserialize
  const serialized   = _serialize(obj, type),
        deserialized = _deserialize(serialized, type, { target: (obj.constructor ? new (obj.constructor)() : {}) }),
        reserialized = _serialize(deserialized, type);

  // Check if serialized and deserialized have correct types
  assert(!(serialized instanceof EnTT));
  assert(deserialized instanceof obj.constructor);
  assert(!(reserialized instanceof EnTT));

  // Check if serialized and reserialized didn't lose data
  expect(serialized).toEqual(reserialized);
  // If original object was constructable, check if original object is same as deserialized one
  if (obj.constructor && obj.constructor !== Object) {
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
function verifyAny (original, exported, { verifyConstructors = false, ignoreKeys = [] } = {}) {

  // Check if object or array
  if (original instanceof Array || original instanceof Object) {

    // Arrays and objects aren't copied by reference
    assert(exported !== original);

    // Compare object or array members
    for (const key of Object.keys(original)) {
      if (ignoreKeys.indexOf(key) === -1) {

        // Verify members' value match
        verifyAny(original[key], exported[key]);

        // If not checking method
        if ((typeof original[key] !== 'function') && (typeof exported[key] !== 'function')) {
          
          // Verify members' types match (unless one is a method)
          assert(typeof original[key] === typeof exported[key]);

          // Verify members' constructors
          if (verifyConstructors && (original[key] || exported[key])) {
            assert(original[key].constructor === exported[key].constructor);
          }

        }

      }
    }

  } else {
    // Primitives are copied and equal
    assert(exported === original);
  }

}
