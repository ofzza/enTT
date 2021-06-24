// enTT lib @Validate decorator tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { EnTT, Validate } from '../../../';
import { _validateObject, _validateProperty } from './internals';
import { Serializable } from '../serializable';

// Import validation providers
import * as Joi from 'joi';
import * as JoiBrowser from 'joi-browser';
import * as Yup from 'yup';

// Test ...
describe('@Validate', () => {
  // Initialize test data models
  class InnerTest extends EnTT {
    constructor() {
      super();
      super.entt();
    }

    @Validate({
      type: 'number',
      provider: (value, obj) => typeof value === 'number' && Math.trunc(value) === value && value > 0,
    })
    public naturalNum = 1;
  }

  class Test extends EnTT {
    constructor() {
      super();
      super.entt();
    }

    @Validate({
      type: 'number',
      provider: (value, obj) => typeof value === 'number' && Math.trunc(value) === value && value > 0,
    })
    public customNaturalNum = 1;

    @Validate({
      type: 'number',
      provider: Joi.number().strict().integer().min(1),
    })
    public joiNaturalNum = 2;

    @Validate({
      type: 'number',
      provider: JoiBrowser.number().strict().integer().min(1),
    })
    public joiBrowserNaturalNum = 3;

    @Validate({
      type: 'number',
      provider: Yup.number().strict().integer().min(1),
    })
    public yupNaturalNum = 4;

    @Validate({
      type: 'number',
      provider: [
        (value, obj) => typeof value === 'number' && Math.trunc(value) === value && value > 0,
        Joi.number().strict().integer().min(1),
        JoiBrowser.number().strict().integer().min(1),
        Yup.number().strict().integer().min(1),
      ],
    })
    public allNaturalNum = 5;

    @Serializable({ cast: InnerTest })
    public enttsingle = new InnerTest();

    @Serializable({ cast: [InnerTest] })
    public enttarrayliteral = [new InnerTest(), new InnerTest(), new InnerTest()];

    @Serializable({ cast: { InnerTest } })
    public enttobjectliteral = { a: new InnerTest(), b: new InnerTest(), c: new InnerTest() };
  }

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

  it('Works with multiple providers per property', () => {
    verifyNaturalNumProperty(Test, 'allNaturalNum', 4);
  });

  describe('Works with nested EnTTs', () => {
    it('Nested single EnTT', () => {
      const instance = new Test();
      const deserialized = Test.clone(instance);
      const serialized = instance.serialize();
      // Test invalid nested values
      (instance.enttsingle.naturalNum as any) = '-3.14';
      {
        const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(instance.valid === false);
        assert(errors.length === 2);
      }
      // Test invalid nested values when set by deserialization
      (serialized.enttsingle.naturalNum as any) = '-3.14';
      deserialized.deserialize(serialized);
      {
        const errors = Object.values(deserialized.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(deserialized.valid === false);
        assert(errors.length === 2);
      }
      // Test valid nested values
      (instance.enttsingle.naturalNum as any) = 1;
      {
        const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(instance.valid === true);
        assert(errors.length === 0);
      }
      // Test valid nested values when set by deserialization
      (serialized.enttsingle.naturalNum as any) = 1;
      deserialized.deserialize(serialized);
      {
        const errors = Object.values(deserialized.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(deserialized.valid === true);
        assert(errors.length === 0);
      }
    });

    it('Nested EnTT array', () => {
      const instance = new Test();
      const deserialized = Test.clone(instance);
      const serialized = instance.serialize();
      // Test invalid nested values
      instance.enttarrayliteral.forEach(instance => {
        (instance.naturalNum as any) = '-3.14';
      });
      {
        const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(instance.valid === false);
        assert(errors.length === 6);
      }
      // Test invalid nested values when set by deserialization
      serialized.enttarrayliteral.forEach(serialized => {
        (serialized.naturalNum as any) = '-3.14';
      });
      deserialized.deserialize(serialized);
      {
        const errors = Object.values(deserialized.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(deserialized.valid === false);
        assert(errors.length === 6);
      }
      // Test valid nested values
      instance.enttarrayliteral.forEach(instance => {
        (instance.naturalNum as any) = 1;
      });
      {
        const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(instance.valid === true);
        assert(errors.length === 0);
      }
      // Test valid nested values when set by deserialization
      serialized.enttarrayliteral.forEach(serialized => {
        (serialized.naturalNum as any) = 1;
      });
      deserialized.deserialize(serialized);
      {
        const errors = Object.values(deserialized.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(deserialized.valid === true);
        assert(errors.length === 0);
      }
    });

    it('Nested EnTT hashmap', () => {
      const instance = new Test();
      const deserialized = Test.clone(instance);
      const serialized = instance.serialize();
      // Test invalid nested values
      Object.values(instance.enttobjectliteral).forEach(instance => {
        (instance.naturalNum as any) = '-3.14';
      });
      {
        const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(instance.valid === false);
        assert(errors.length === 6);
      }
      // Test invalid nested values when set by deserialization
      Object.values(serialized.enttobjectliteral).forEach((serialized: InnerTest) => {
        (serialized.naturalNum as any) = '-3.14';
      });
      deserialized.deserialize(serialized);
      {
        const errors = Object.values(deserialized.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(deserialized.valid === false);
        assert(errors.length === 6);
      }
      // Test valid nested values
      Object.values(instance.enttobjectliteral).forEach(instance => {
        (instance.naturalNum as any) = 1;
      });
      {
        const errors = Object.values(instance.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(instance.valid === true);
        assert(errors.length === 0);
      }
      // Test valid nested values when set by deserialization
      Object.values(serialized.enttobjectliteral).forEach((serialized: InnerTest) => {
        (serialized.naturalNum as any) = 1;
      });
      deserialized.deserialize(serialized);
      {
        const errors = Object.values(deserialized.errors).reduce((errors, errs) => [...errors, ...errs], []);
        assert(deserialized.valid === true);
        assert(errors.length === 0);
      }
    });
  });

  it('Allows overriding when extending EnTT classes', () => {
    class TestBase extends EnTT {
      constructor() {
        super();
        this.entt();
      }

      @Validate({ type: 'boolean' })
      public propA = true as any;

      @Validate({ provider: (value, obj) => !!value })
      public propB = true as any;
    }

    class Test extends TestBase {
      constructor() {
        super();
        this.entt();
      }

      @Validate({ type: 'number' })
      public propA = 0 as any;

      @Validate({ provider: (value, obj) => value < 10 })
      public propB = 0 as any;
    }

    const base = new TestBase();
    assert(base.valid === true);
    assert(base.valid === true);
    base.propA = false;
    assert(base.valid === true);
    base.propB = false;
    assert(base.valid === false);

    const test = new Test();
    assert(test.valid === true);
    assert(test.valid === true);
    test.propA = false;
    assert(test.valid === false);
    assert(test.errors.propA.length === 1);
    test.propB = 100;
    assert(test.valid === false);
    assert(test.errors.propB.length === 1);
  });
});

/**
 * Verifies validation for natural number property
 * @param Class Class to verify
 * @param key Property key
 * @param providersCount Number of validation providers expected to give same result, on top of type validation
 */
function verifyNaturalNumProperty(Class, key, providersCount = 1) {
  // Explicitly test valid object
  {
    const instance = new Class();
    // Test initial, valid values
    verifyNaturalNumPropertyErrors(instance, key, providersCount);
    assert(Object.keys(_validateObject(instance)).length === 0);
    assert(instance.valid === true);
    assert(Object.values(instance.errors).length === 0);
  }
  // Explicitly test invalid object
  {
    const instance = new Class();
    // Set invalid value and manually run validation
    (instance as any)[key] = '-3.14';
    assert(Object.keys(_validateObject(instance)).length === 1);
    assert(instance.valid === false);
    assert(Object.values(instance.errors).length === 1);
    assert(!!instance.errors[key]);
    assert(instance.errors[key].length === providersCount + 1);
    // Revert invalid value
    instance.revert(key);
    assert(instance.valid === true);
    assert(Object.values(instance.errors).length === 0);
  }
  // Implicitly test invalid object
  {
    const instance = new Class();
    // Set invalid value
    (instance as any)[key] = '-3.14';
    assert(instance.valid === false);
    assert(Object.values(instance.errors).length === 1);
    assert(!!instance.errors[key]);
    assert(instance.errors[key].length === providersCount + 1);
    // Revert invalid value
    instance.revert(key);
    assert(instance.valid === true);
    assert(Object.values(instance.errors).length === 0);
  }
}

/**
 * Verify validation errors for natural number property
 * @param instance Parent object hosting the property
 * @param key Property key
 * @param providersCount Number of validation providers expected to give same result, on top of type validation
 */
function verifyNaturalNumPropertyErrors(instance, key, providersCount = 1) {
  {
    const errors = _validateProperty(instance, key, 1);
    assert(errors.length === 0);
  }
  {
    const errors = _validateProperty(instance, key, '1');
    assert(errors.length === providersCount + 1);
    assert(!errors.find(err => !(err instanceof Error)));
  }
  {
    const errors = _validateProperty(instance, key, -3);
    assert(errors.length === providersCount);
    assert(!errors.find(err => !(err instanceof Error)));
  }
  {
    const errors = _validateProperty(instance, key, -3.14);
    assert(errors.length === providersCount);
    assert(!errors.find(err => !(err instanceof Error)));
  }
}
