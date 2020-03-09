// enTT lib @Validate decorator tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { EnTT, Validate }  from '../../../';
import { _validateObject, _validateProperty } from './'

// Import validation providers
import * as Joi from '@hapi/joi';
import * as JoiBrowser from 'joi-browser';
import * as Yup from 'yup';

// Test ...
describe('@Validate', () => {

  // Initialize test data models
  class Test extends EnTT {
    constructor () { super(); super.entt(); }

    @Validate({
      type: 'number',
      provider: (obj, value) => ((typeof value === 'number') && (Math.trunc(value) === value) && (value > 0))
    })
    public customNaturalNum = 1;

    @Validate({
      type: 'number',
      provider: Joi.number().strict().integer().min(1)
    })
    public joiNaturalNum = 2;

    @Validate({
      type: 'number',
      provider: JoiBrowser.number().strict().integer().min(1)
    })
    public joiBrowserNaturalNum = 3;

    @Validate({
      type: 'number',
      provider: Yup.number().strict().integer().min(1)
    })
    public yupNaturalNum = 4;
  }

  // Run tests
  describe('Works with different validation providers', () => {

    it('custom', () => {
      verifyNaturalNumProperty(Test, 'customNaturalNum');
    });

    it('@hapi/joi', () => {
      verifyNaturalNumProperty(Test, 'joiNaturalNum');
    });

    it('joi-browser', () => {
      verifyNaturalNumProperty(Test, 'joiBrowserNaturalNum');
    });

    it('yup', () => {
      verifyNaturalNumProperty(Test, 'yupNaturalNum');
    });

  });

});

/**
 * Verifies validation for natural number property
 * @param Class Class to verify
 * @param key Property key
 */
function verifyNaturalNumProperty (Class, key) {
  // Explicitly test valid object
  {
    const instance = new Class();
    // Test initial, valid values
    verifyNaturalNumPropertyErrors(instance, key);
    assert(Object.keys(_validateObject(instance)).length === 0);
    assert(instance.valid === true);
    assert(instance.errors[key].length === 0);
  }
  // Explicitly test invalid object
  {
    const instance = new Class();
    // Set invalid value and manually run validation
    (instance as any)[key] = '-3.14';
    assert(Object.keys(_validateObject(instance)).length === 1);
    assert(instance.valid === false);
    assert(instance.errors[key].length === 2);
    // Revert invalid value
    instance.revert(key);
    assert(instance.valid === true);
    assert(instance.errors[key].length === 0);
  }
  // Implicitly test invalid object
  {
    const instance = new Class();
    // Set invalid value
    (instance as any)[key] = '-3.14';
    assert(instance.valid === false);
    assert(instance.errors[key].length === 2);
    // Revert invalid value
    instance.revert(key);
    assert(instance.valid === true);
    assert(instance.errors[key].length === 0);
  }  
}

/**
 * Verify validation errors for natural number property
 * @param instance Parent object hosting the property
 * @param key Property key
 */
function verifyNaturalNumPropertyErrors (instance, key) {
  {
    const errors = _validateProperty(instance, key, 1);
    assert(errors.length === 0);
  }
  {
    const errors = _validateProperty(instance, key, '1');
    assert(errors.length === 2);
    assert(errors[0] instanceof Error);
    assert(errors[1] instanceof Error);
  }
  {
    const errors = _validateProperty(instance, key, -3);
    assert(errors.length === 1);
    assert(errors[0] instanceof Error);
  }
  {
    const errors = _validateProperty(instance, key, -3.14);
    assert(errors.length === 1);
    assert(errors[0] instanceof Error);
  }
}
