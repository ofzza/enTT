// Static class decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { Class, ClassInstance } from '@ofzza/ts-std/types/corejs/class';
import { createClassCustomDecorator, getDecoratedClassDefinition, filterDefinition, EnttDefinition } from '../';

// #region Fixtures

// Unique identifier symbol identifying the FromString decorator
const fromStringDecoratorSymbol = Symbol('From string class decorator');
/**
 * Decorates a class with a default value
 * @param data Mapping function converting instance of the class into a string
 * @returns Class decorator
 */
function FromString(data: (serialized: string) => Record<PropertyKey, string>) {
  return createClassCustomDecorator(() => data, fromStringDecoratorSymbol);
}

// Unique identifier symbol identifying the AsString decorator
const asStringDecoratorSymbol = Symbol('As string class decorator');
/**
 * Decorates a class with a default value
 * @param data Mapping function converting instance of the class into a string
 * @returns Class decorator
 */
function AsString(data: (target: Record<PropertyKey, string>) => string) {
  return createClassCustomDecorator(() => data, asStringDecoratorSymbol);
}

/**
 * Creates an instance of a class decorated with the @AsString decorator from a string
 * @param target Decorated class instance
 * @param text String representation
 * @returns Created instance of the decorated class
 */
function createInstanceFromText<T extends ClassInstance>(target: Class<T>, text: string): ClassInstance<T> {
  const definition = getDecoratedClassDefinition(target);
  const valuesFromStringFn = definition.decorators.bySymbol[fromStringDecoratorSymbol][0].data as (serialized: string) => Record<PropertyKey, string>;
  const valuesFromString = valuesFromStringFn(text) as ClassInstance<T>;
  const instance = new target() as ClassInstance<T>;
  for (const key of Object.keys(valuesFromString)) {
    instance[key as keyof typeof instance] = valuesFromString[key as keyof typeof valuesFromString];
  }
  return instance;
}
/**
 * Composes a string representation of a class instance based on the @AsString decorator
 * @param target Decorated class instance
 * @returns String representation
 */
function convertInstanceToText<T extends ClassInstance>(target: ClassInstance<T>) {
  const definition = getDecoratedClassDefinition(target);
  const instanceToStringFn = definition.decorators.bySymbol[asStringDecoratorSymbol][0].data as (target: Record<PropertyKey, string>) => string;
  return instanceToStringFn(target as Record<PropertyKey, string>);
}

// #endregion

// #region Tests

// Export tests
export function testStaticClassDecorators() {
  // Define a class for testing class decorators
  @AsString(target => `${target['who']} did a ${target['what']} in ${target['where']}`)
  @FromString(serialized => ({
    who: serialized.match(/(.*?) did a .*? in .*/)?.[1]?.trim() || '',
    what: serialized.match(/.*? did a (.*?) in .*/)?.[1]?.trim() || '',
    where: serialized.match(/.*? did a .*? in (.*)/)?.[1]?.trim() || '',
  }))
  class Test {
    public who!: string;
    public what!: string;
    public where!: string;
  }

  // Check if, given a non-existent class, definitions will still be returned well formed
  describe('Accessing definitions for a non-existent class will still returns a well formed definitions object', () => {
    // Validation of an empty EnTT definition
    function validateEmptyDefinition(target: any) {
      it(`getDecoratedClassDefinition(${
        (typeof target === 'function' ? target?.name : false) || JSON.stringify(target)
      }) returns a valid empty definition`, () => {
        // Get definition
        const def = getDecoratedClassDefinition(target as unknown as Class<Test>);
        // Check definition
        assert(!!def);
        assert(def instanceof Object);
        // Check decorators
        assert(def.decorators instanceof Object);
        assert(def.decorators.all instanceof Array);
        assert(def.decorators.all.length === 0);
        assert(def.decorators.bySymbol instanceof Object);
        assert(Object.keys(def.decorators.bySymbol).length === 0);
        // Check properties
        assert(def.properties instanceof Object);
        assert(Object.keys(def.properties).length === 0);
      });
    }

    // Get missing definitions via unknown
    validateEmptyDefinition(undefined);
    validateEmptyDefinition(null);
    validateEmptyDefinition({});
    validateEmptyDefinition(Date);
  });

  // Check if, given a class, class can be found as having been decorated
  describe('Definitions are set correctly and can be reached via class', () => {
    // Get definitions via class
    const definition = getDecoratedClassDefinition(Test);

    // Entity definition exists and fetched and has correct owner info set
    it('Definitions are set correctly and can be reached via class', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });
    // Entity decorator definitions exists and fetched, have correct owner info set and have decorator information correctly set
    it('Definitions are set correctly, can be reached via class and contain decorator definitions and data', () => {
      // FromString decorator has stored data into its definitions
      assert(!!definition.decorators.bySymbol[fromStringDecoratorSymbol]);
      assert(definition.decorators.bySymbol[fromStringDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[fromStringDecoratorSymbol][0].owner === Test);
      assert(!!definition.decorators.bySymbol[fromStringDecoratorSymbol][0].data);
      // AsString decorator has stored data into its definitions
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol]);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol][0].owner === Test);
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol][0].data);
    });
  });

  // Check if, given a class, entity definition can be filtered for only a particular decorator
  describe('Filtering of entity definition by decorator, given a class, works', () => {
    // Get definitions via class
    const definition = filterDefinition(getDecoratedClassDefinition(Test), asStringDecoratorSymbol);

    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set correctly and can be reached via class', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });
    // Check if filtering works
    it('Filtering of definitions by decorator, given a class, works', () => {
      // FromString decorator has beein filtered out
      assert(!definition.decorators.bySymbol[fromStringDecoratorSymbol]);
      // AsString decorator has been filtered and has stored data into its definitions
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol]);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol][0].owner === Test);
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol][0].data);
    });
  });

  // Given a class, use decorated class configuration
  it('Decorated class can be used within real featured functionality via class', () => {
    // Instantiate Test from a string and check if all properties are set correctly
    const test = createInstanceFromText(Test, 'WHO did a WHAT in WHERE');
    assert(!!test);
    assert(test['who'] === 'WHO');
    assert(test['what'] === 'WHAT');
    assert(test['where'] === 'WHERE');
  });

  // Check if, given a class instance, class can be found as having been decorated
  describe('Definitions are set correctly and can be reached via class instance', () => {
    // Get definitions via class
    const definition = getDecoratedClassDefinition(new Test());

    // Entity definition exists and fetched and has correct owner info set
    it('Definitions are set correctly and can be reached via class', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });
    // Entity decorator definitions exists and fetched, have correct owner info set and have decorator information correctly set
    it('Definitions are set correctly, can be reached via class and contain decorator definitions and data', () => {
      // FromString decorator has stored data into its definitions
      assert(!!definition.decorators.bySymbol[fromStringDecoratorSymbol]);
      assert(definition.decorators.bySymbol[fromStringDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[fromStringDecoratorSymbol][0].owner === Test);
      assert(!!definition.decorators.bySymbol[fromStringDecoratorSymbol][0].data);
      // AsString decorator has stored data into its definitions
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol]);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol][0].owner === Test);
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol][0].data);
    });
  });

  // Check if, given a class instance, entity definition can be filtered for only a particular decorator
  describe('Filtering of entity definition by decorator, given a class instance, works', () => {
    // Get definitions via class
    const definition = filterDefinition(getDecoratedClassDefinition(new Test()), asStringDecoratorSymbol);

    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set correctly and can be reached via class', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });
    // Check if filtering works
    it('Filtering of definitions by decorator, given a class, works', () => {
      // FromString decorator has beein filtered out
      assert(!definition.decorators.bySymbol[fromStringDecoratorSymbol]);
      // AsString decorator has been filtered and has stored data into its definitions
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol]);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[asStringDecoratorSymbol][0].owner === Test);
      assert(!!definition.decorators.bySymbol[asStringDecoratorSymbol][0].data);
    });
  });

  // Given a class instance, use decorated class configuration
  it('Decorated class can be used within real featured functionality via class instance', () => {
    // Instantiate Test and set properties
    const test = new Test();
    test.who = 'WHO';
    test.what = 'WHAT';
    test.where = 'WHERE';
    // Convert Test instance to string and check string
    const text = convertInstanceToText(test);
    assert(!!text);
    assert(text === 'WHO did a WHAT in WHERE');
  });
}

// #endregion
