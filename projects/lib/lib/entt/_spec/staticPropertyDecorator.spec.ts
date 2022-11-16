// Static property decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { Class, PropertyName, createPropertyCustomDecorator, getDecoratedClassDefinition, filterDefinition } from '../';

// Unique identifier symbol identifying the DefaultValue decorator
const defaultValueDecoratorSymbol = Symbol('Default value property decorator');
/**
 * Decorates a property with a default value
 * @param data Default value for a property
 * @returns Property decorator
 */
function DefaultValue(data: any) {
  return createPropertyCustomDecorator(() => data, defaultValueDecoratorSymbol);
}

// Unique identifier symbol identifying the Label decorator
const labelDecoratorSymbol = Symbol('Label property decorator');
/**
 * Decorates a property with a label
 * @param label Property label
 * @returns Property decorator
 */
function Label(label: string) {
  return createPropertyCustomDecorator(() => label, labelDecoratorSymbol);
}

/**
 * Initializes a class and sets values configured via the DefaultValue decorator
 * @param target The class to be initialized
 * @returns Instance with values set as configured
 */
function initializeWithDefaultValues<T extends object>(target: Class<T>): T {
  const definition = getDecoratedClassDefinition(target);
  return Object.keys(definition.properties).reduce((instance, key) => {
    (instance as any)[key] = definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0]?.data;
    return instance;
  }, new target());
}

/**
 * Finds decorated properties and veriifes whick contain the same value as configured via the DefaultValue decorator
 * @param target The class instance to verify
 * @returns A record of property value verification
 */
function checkDefaultValues<T extends object>(target: T): Record<PropertyName, boolean> {
  const definition = getDecoratedClassDefinition(target);
  return Object.keys(definition.properties).reduce((check, key) => {
    (check as any)[key] = (target as any)[key] === definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0]?.data;
    return check;
  }, {});
}

// Export tests
export function testsStaticPropertyDecorators() {
  // Set valid data to be used by the decorators
  const defaults = { pub: true, prot: 1, priv: 'abc' };
  const publicPropertyLabel = 'A public property';
  // Define a class for testing property decorators and decorate all properties with differing access levels
  class Test {
    // Making sure decorators work on public properties
    @Label(publicPropertyLabel)
    @DefaultValue(defaults['pub'])
    public pub!: boolean;
    // Making sure decorators work on protected properties
    @DefaultValue(defaults['prot'])
    protected prot!: number;
    // Making sure decorators work on private properties
    @DefaultValue(defaults['priv'])
    private priv!: string;
  }

  // Check if, given a class, properties can be found as having been decorated
  describe('Definitions are set correctly and can be reached via class', () => {
    // Get definitions via class
    const definition = getDecoratedClassDefinition(Test);

    // Entity definition exists and fetched and has correct owner info set
    it('Definitions are set correctly and can be reached via class', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });
    // Entity properties' definitions exists and fetched, have correct owner info set and have decorator information correctly set
    for (const key of Object.keys(defaults)) {
      const access = { pub: 'public', prot: 'protected', priv: 'private' }[key];
      it(`Definitions are set correctly and can be reached via class for ${access} properties`, () => {
        assert(!!definition.properties[key]);
        assert(definition.properties[key].owner === Test);
        assert(definition.properties[key].ownerPropertyKey === key);
        assert(!!definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol]);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol].length === 1);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].owner === Test);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].ownerPropertyKey === key);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].decoratorSymbol === defaultValueDecoratorSymbol);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].data === defaults[key as keyof typeof defaults]);
      });
    }
  });

  // Check if, given a class, entity definition can be filtered for only a particular decorator
  describe('Filtering of entity definition by decorator, given a class, works', () => {
    // Get definitions via class
    const definition = filterDefinition(getDecoratedClassDefinition(Test), labelDecoratorSymbol);

    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set correctly and can be reached via class', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });

    // Entity properties' definitions exists and fetched, have correct owner info set and have decorator information correctly set
    it(`Filtered definitions are set correctly and can be reached via class for properties`, () => {
      assert(!!definition.properties['pub']);
      assert(definition.properties['pub'].owner === Test);
      assert(definition.properties['pub'].ownerPropertyKey === 'pub');
      assert(!!definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol].length === 1);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].owner === Test);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].ownerPropertyKey === 'pub');
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].decoratorSymbol === labelDecoratorSymbol);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].data === publicPropertyLabel);
    });

    // Check if filtering works
    it('Filtering of definitions by decorator, given a class, works', () => {
      // Filtered definition exists
      assert(!!definition);
      // Filtered only to properties definitions containing the filtered decorator
      assert(!!definition.properties['pub']);
      assert(Object.keys(definition.properties).length === 1);
      // Filtered only to property decorator definition for the filtered decorator
      assert(!definition.properties['pub'].decorators.bySymbol[defaultValueDecoratorSymbol]);
      assert(!!definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.properties['pub'].decorators.all.length === 1);
    });
  });

  // Check if, given a class, entity property definition can be filtered for only a particular decorator
  describe('Filtering of entity property definitions by decorator, given a class, works', () => {
    // Get definitions via class
    const definition = filterDefinition(getDecoratedClassDefinition(Test).properties['pub'], labelDecoratorSymbol);

    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set correctly and can be reached via class', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });

    // Entity properties' definitions exists and fetched, have correct owner info set and have decorator information correctly set
    it(`Filtered definitions are set correctly and can be reached via class for properties`, () => {
      assert(!!definition.decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].owner === Test);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].ownerPropertyKey === 'pub');
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].decoratorSymbol === labelDecoratorSymbol);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].data === publicPropertyLabel);
    });

    // Check if filtering works
    it('Filtering of definitions by decorator, given a class, works', () => {
      // Filtered definition exists
      assert(!!definition);
      // Filtered only to property decorator definition for the filtered decorator
      assert(!definition.decorators.bySymbol[defaultValueDecoratorSymbol]);
      assert(!!definition.decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.decorators.all.length === 1);
    });
  });

  // Given a class, use decorated properties configuration
  it('Decorated properties can be used within real featured functionality via class', () => {
    // Instantiate Test with default values set by the decorator
    const test = initializeWithDefaultValues(Test);
    assert(!!test);
    assert(test['pub'] === defaults['pub']);
    assert((test as any)['prot'] === defaults['prot']); // Cheating to get access to protected property
    assert((test as any)['priv'] === defaults['priv']); // Cheating to get access to protected property
  });

  // Check if, given a class instance, properties can be found as having been decorated
  describe('Definitions are set correctly and can be reached via class instance', () => {
    // Get definitions via class instance
    const definition = getDecoratedClassDefinition(new Test());

    // Entity definition exists and fetched and has correct owner info set
    it('Definitions are set and can be reached via class instance', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });
    // Entity properties' definitions exists and fetched, have correct owner info set and have decorator information correctly set
    for (const key of Object.keys(defaults)) {
      const access = { pub: 'public', prot: 'protected', priv: 'private' }[key];
      it(`Definitions are set correctly and can be reached via class instance for ${access} properties`, () => {
        assert(!!definition.properties[key]);
        assert(definition.properties[key].owner === Test);
        assert(definition.properties[key].ownerPropertyKey === key);
        assert(!!definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol]);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol].length);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].owner === Test);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].ownerPropertyKey === key);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].decoratorSymbol === defaultValueDecoratorSymbol);
        assert(definition.properties[key].decorators.bySymbol[defaultValueDecoratorSymbol][0].data === defaults[key as keyof typeof defaults]);
      });
    }
  });

  // Check if, given a class instance, entity definition can be filtered for only a particular decorator
  describe('Filtering of entity definition by decorator, given a class instance, works', () => {
    // Get definitions via class instance
    const definition = filterDefinition(getDecoratedClassDefinition(new Test()), labelDecoratorSymbol);

    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set and can be reached via class instance', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });

    // Entity properties' definitions exists and fetched, have correct owner info set and have decorator information correctly set
    it(`Filtered definitions are set correctly and can be reached via class for properties`, () => {
      assert(!!definition.properties['pub']);
      assert(definition.properties['pub'].owner === Test);
      assert(definition.properties['pub'].ownerPropertyKey === 'pub');
      assert(!!definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol].length);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].owner === Test);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].ownerPropertyKey === 'pub');
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].decoratorSymbol === labelDecoratorSymbol);
      assert(definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol][0].data === publicPropertyLabel);
    });

    // Check if filtering works
    it('Filtering of definitions by decorator, given a class instance, works', () => {
      // Filtered definition exists
      assert(!!definition);
      // Filtered only to properties definitions containing the filtered decorator
      assert(!!definition.properties['pub']);
      assert(Object.keys(definition.properties).length === 1);
      // Filtered only to property decorator definition for the filtered decorator
      assert(!definition.properties['pub'].decorators.bySymbol[defaultValueDecoratorSymbol]);
      assert(!!definition.properties['pub'].decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.properties['pub'].decorators.all.length === 1);
    });
  });

  // Check if, given a class instance, entity property definition can be filtered for only a particular decorator
  describe('Filtering of entity property definitions by decorator, given a class instance, works', () => {
    // Get definitions via class instance
    const definition = filterDefinition(getDecoratedClassDefinition(Test).properties['pub'], labelDecoratorSymbol);

    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set and can be reached via class instance', () => {
      assert(!!definition);
      assert(definition.owner === Test);
    });

    // Entity properties' definitions exists and fetched, have correct owner info set and have decorator information correctly set
    it(`Filtered definitions are set correctly and can be reached via class for properties`, () => {
      assert(!!definition.decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol].length === 1);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].owner === Test);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].ownerPropertyKey === 'pub');
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].decoratorSymbol === labelDecoratorSymbol);
      assert(definition.decorators.bySymbol[labelDecoratorSymbol][0].data === publicPropertyLabel);
    });

    // Check if filtering works
    it('Filtering of definitions by decorator, given a class instance, works', () => {
      // Filtered definition exists
      assert(!!definition);
      // Filtered only to property decorator definition for the filtered decorator
      assert(!definition.decorators.bySymbol[defaultValueDecoratorSymbol]);
      assert(!!definition.decorators.bySymbol[labelDecoratorSymbol]);
      assert(definition.decorators.all.length === 1);
    });
  });

  // Given a class instance, use decorated properties configuration
  it('Decorated properties can be used within real featured functionality via class instance', () => {
    // Check values of a Test instance against defaults set by the decorator
    const test = new Test();
    let check = checkDefaultValues(test);
    assert(!!check);
    assert(check['pub'] === false);
    assert(check['prot'] === false);
    assert(check['priv'] === false);

    // Check after values changed to different than default
    test['pub'] = !defaults['pub'];
    (test as any)['prot'] = defaults['prot'] + 1; // Cheating to get access to protected property
    (test as any)['priv'] = defaults['priv'] + 'x'; // Cheating to get access to private property
    check = checkDefaultValues(test);
    assert(!!check);
    assert(check['pub'] === false);
    assert(check['prot'] === false);
    assert(check['priv'] === false);

    // Check after values changed back to default
    test['pub'] = defaults['pub'];
    check = checkDefaultValues(test);
    assert(!!check);
    assert(check['pub'] === true);
    assert(check['prot'] === false);
    assert(check['priv'] === false);

    (test as any)['prot'] = defaults['prot']; // Cheating to get access to protected property
    check = checkDefaultValues(test);
    assert(!!check);
    assert(check['pub'] === true);
    assert(check['prot'] === true);
    assert(check['priv'] === false);

    (test as any)['priv'] = defaults['priv']; // Cheating to get access to private property
    check = checkDefaultValues(test);
    assert(!!check);
    assert(check['pub'] === true);
    assert(check['prot'] === true);
    assert(check['priv'] === true);
  });
}
