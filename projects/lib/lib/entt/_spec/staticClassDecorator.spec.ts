// Static class decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { Class, ClassInstance, PropertyName, createClassCustomDecorator, getDecoratedClassDefinition, filterDefinition } from '../';

// Unique identifier symbol identifying the FromString decorator
const fromStringDecoratorSymbol = Symbol('From string class decorator');
/**
 * Decorates a class with a default value
 * @param data Mapping function converting instance of the class into a string
 * @returns Class decorator
 */
function FromString(data: (serialized: string) => Record<PropertyName, string>) {
  return createClassCustomDecorator(() => data, fromStringDecoratorSymbol);
}

// Unique identifier symbol identifying the AsString decorator
const asStringDecoratorSymbol = Symbol('As string class decorator');
/**
 * Decorates a class with a default value
 * @param data Mapping function converting instance of the class into a string
 * @returns Class decorator
 */
function AsString(data: (target: Record<PropertyName, string>) => string) {
  return createClassCustomDecorator(() => data, asStringDecoratorSymbol);
}

function createInstanceFromText<T extends object>(target: Class<T>, text: string) {
  const definition = getDecoratedClassDefinition(target);
  const valuesFromStringFn = definition.decorators.bySymbol[fromStringDecoratorSymbol][0].data as (serialized: string) => Record<PropertyName, string>;
  const valuesFromString = valuesFromStringFn(text) as T;
  const instance = new target();
  for (const key of Object.keys(valuesFromString)) {
    instance[key as keyof T] = valuesFromString[key as keyof T];
  }
  return instance;
}

/**
 * Composes a string representation of a class instance based on the @AsString decorator
 * @param target Decorated class instance
 * @returns String representation
 */
function convertInstanceToText<T extends object>(target: ClassInstance<T>) {
  const definition = getDecoratedClassDefinition(target);
  const instanceToStringFn = definition.decorators.bySymbol[asStringDecoratorSymbol][0].data as (target: Record<PropertyName, string>) => string;
  return instanceToStringFn(target as Record<PropertyName, string>);
}

// Export tests
export function testsStaticClassDecorators() {
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
