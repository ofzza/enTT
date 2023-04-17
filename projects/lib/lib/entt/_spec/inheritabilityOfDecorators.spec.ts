// Decorators inheritability with class inheritence TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import {
  Class,
  createClassCustomDecorator,
  getDecoratedClassDefinition,
  getDecoratedClassDecoratorDefinition,
  createPropertyCustomDecorator,
  getDecoratedClassPropertyDefinition,
  getDecoratedClassPropertyDecoratorDefinition,
  enttify,
} from '../';

// Unique identifier symbol identifying the Decorative class decorator
const decoClassDecoratorSymbol = Symbol('Decorative class decorator');
/**
 * Marks a class as "Decorative"
 * @returns Class decorator
 */
function Decorative() {
  return createClassCustomDecorator(
    {
      composeDecoratorMultipleUsagePermission: () => true,
    },
    decoClassDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the Marco class decorator
const marcoClassDecoratorSymbol = Symbol('Marco class decorator');
/**
 * Marks a class as "Marko"
 * @returns Class decorator
 */
function Marco() {
  return createClassCustomDecorator(
    {
      composeDecoratorMultipleUsagePermission: () => true,
    },
    marcoClassDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the Polo class decorator
const poloClassDecoratorSymbol = Symbol('Polo class decorator');
/**
 * Marks a class as "Polo"
 * @returns Class decorator
 */
function Polo() {
  return createClassCustomDecorator(
    {
      composeDecoratorMultipleUsagePermission: () => true,
    },
    poloClassDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the Decorative property decorator
const decoPropertyDecoratorSymbol = Symbol('Decorative property decorator');
/**
 * Marks a property as "Decorative"
 * @returns Property decorator
 */
function DecorativeProp() {
  return createPropertyCustomDecorator(
    {
      composeDecoratorMultipleUsagePermission: () => true,
    },
    decoPropertyDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the Marco property decorator
const marcoPropertyDecoratorSymbol = Symbol('Marco property decorator');
/**
 * Marks a property as "Marko"
 * @returns Property decorator
 */
function MarcoProp() {
  return createPropertyCustomDecorator(
    {
      composeDecoratorMultipleUsagePermission: () => true,
    },
    marcoPropertyDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the Polo property decorator
const poloPropertyDecoratorSymbol = Symbol('Polo property decorator');
/**
 * Marks a property as "Polo"
 * @returns Property decorator
 */
function PoloProp() {
  return createPropertyCustomDecorator(
    {
      composeDecoratorMultipleUsagePermission: () => true,
    },
    poloPropertyDecoratorSymbol,
  );
}

/**
 * Define a base class
 */
@Decorative()
@Marco()
class MarcoClass {
  /**
   * Example property
   */
  @DecorativeProp()
  @MarcoProp()
  public prop!: any;
}

/**
 * Define an extending class, extending the base class, decorated with an additional decorator
 */
@Decorative()
@Polo()
class PoloClass extends MarcoClass {
  /**
   * Override of the example property, decorated with an additional decorator
   */
  @DecorativeProp()
  @PoloProp()
  public override prop!: any;
}

// Export tests
export function testInheritabilityOfDecorators() {
  // Instantiate a base class
  const marco = new MarcoClass();
  // Instantiate the extending class
  const polo = new PoloClass();

  // Enttitify base class
  const EnttifiedMarcoClass = enttify(MarcoClass);
  // Enttitify extending class
  const EnttifiedPoloClass = enttify(PoloClass);
  // Extend enttified base class
  class ExtendedEnttifiedMarcoClass extends EnttifiedMarcoClass {}
  // Extend enttified extending class
  class ExtendedEnttifiedPoloClass extends EnttifiedPoloClass {}

  // Instantiate enttitified base class
  const enttifiedMarco = new EnttifiedMarcoClass();
  // Instantiate enttitified extending class
  const enttifiedPolo = new EnttifiedPoloClass();
  // Instantiate extended enttified base class
  const extendedEnttifiedMarco = new ExtendedEnttifiedMarcoClass();
  // Instantiate extended enttified extending class
  const extendedEnttifiedPolo = new ExtendedEnttifiedPoloClass();

  // Tests Marco (based) class's class decorators
  function testMarcoClassDecorators<T extends MarcoClass>(instance: T) {
    // Get full class definition for the base class
    const definition = getDecoratedClassDefinition(instance);
    const defAll = definition.decorators.all;
    const defBySym = definition.decorators.bySymbol;
    // Verify all decorators are present and no extended decorators have poluted the base class
    assert(defAll.length === 2);
    assert(defAll.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defAll.filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[decoClassDecoratorSymbol].length === 1);
    assert(defBySym[decoClassDecoratorSymbol].filter(def => def.decoratorSymbol === decoClassDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[marcoClassDecoratorSymbol].length === 1);
    assert(defBySym[marcoClassDecoratorSymbol].filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol && def.owner === MarcoClass).length === 1);
    // Get explicit decorator definitions for the base class
    const marcoClassDecoratorDefinition = getDecoratedClassDecoratorDefinition(marco, decoClassDecoratorSymbol);
    // Verify base class decorators are present when searching for an explicit class decorator
    assert(marcoClassDecoratorDefinition.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 1);
  }
  // Tests Marco (based) class's class property decorators
  function testMarcoClassPropertyDecorators<T extends MarcoClass>(instance: T) {
    // Get full class definition for the base class
    const definition = getDecoratedClassPropertyDefinition(instance, 'prop');
    const defAll = definition.decorators.all;
    const defBySym = definition.decorators.bySymbol;
    // Verify all decorators are present and no extended decorators have poluted the base class
    assert(defAll.length === 2);
    assert(defAll.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defAll.filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[decoPropertyDecoratorSymbol].length === 1);
    assert(defBySym[decoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[marcoPropertyDecoratorSymbol].length === 1);
    assert(defBySym[marcoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol && def.owner === MarcoClass).length === 1);
    // Get explicit decorator definitions for the base class
    const marcoPropertyDecoratorDefinition = getDecoratedClassPropertyDecoratorDefinition(marco, 'prop', decoPropertyDecoratorSymbol);
    // Verify base class property decorators are present when searching for an explicit class decorator
    assert(marcoPropertyDecoratorDefinition.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 1);
  }
  // Tests Polo (based) class's class decorators
  function testPoloClassDecorators<T extends PoloClass>(instance: T) {
    // Get full class definition for the extended class
    const definition = getDecoratedClassDefinition(instance);
    const defAll = definition.decorators.all;
    const defBySym = definition.decorators.bySymbol;
    // Verify all base and extended class decorators are present
    assert(defAll.length === 4);
    assert(defAll.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 2);
    assert(defAll.filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol).length === 1);
    assert(defAll.filter(def => def.decoratorSymbol === poloClassDecoratorSymbol).length === 1);
    assert(defBySym[decoClassDecoratorSymbol].length === 2);
    assert(defBySym[decoClassDecoratorSymbol].filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 2);
    assert(defBySym[decoClassDecoratorSymbol].filter(def => def.decoratorSymbol === decoClassDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[decoClassDecoratorSymbol].filter(def => def.decoratorSymbol === decoClassDecoratorSymbol && def.owner === PoloClass).length === 1);
    assert(defBySym[marcoClassDecoratorSymbol].length === 1);
    assert(defBySym[marcoClassDecoratorSymbol].filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[marcoClassDecoratorSymbol].filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol && def.owner === PoloClass).length === 0);
    assert(defBySym[poloClassDecoratorSymbol].length === 1);
    assert(defBySym[poloClassDecoratorSymbol].filter(def => def.decoratorSymbol === poloClassDecoratorSymbol && def.owner === MarcoClass).length === 0);
    assert(defBySym[poloClassDecoratorSymbol].filter(def => def.decoratorSymbol === poloClassDecoratorSymbol && def.owner === PoloClass).length === 1);
    // Get explicit decorator definitions for the extended class
    const poloClassDecoratorDefinition = getDecoratedClassDecoratorDefinition(polo, decoClassDecoratorSymbol);
    // Verify extended class decorators were both inherited and added when searching for an explicit class decorator
    assert(poloClassDecoratorDefinition.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 2);
  }
  // Tests Polo (based) class's class property decorators
  function testPoloClassPropertyDecorators<T extends PoloClass>(instance: T) {
    // Get full class definition for the extended class
    const definition = getDecoratedClassPropertyDefinition(instance, 'prop');
    const defAll = definition.decorators.all;
    const defBySym = definition.decorators.bySymbol;
    // Verify all base and extended class decorators are present
    assert(defAll.length === 4);
    assert(defAll.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 2);
    assert(defAll.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defAll.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol && def.owner === PoloClass).length === 1);
    assert(defAll.filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol).length === 1);
    assert(defAll.filter(def => def.decoratorSymbol === poloPropertyDecoratorSymbol).length === 1);
    assert(defBySym[decoPropertyDecoratorSymbol].length === 2);
    assert(defBySym[decoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 2);
    assert(defBySym[decoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[decoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol && def.owner === PoloClass).length === 1);
    assert(defBySym[marcoPropertyDecoratorSymbol].length === 1);
    assert(defBySym[marcoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol && def.owner === MarcoClass).length === 1);
    assert(defBySym[marcoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol && def.owner === PoloClass).length === 0);
    assert(defBySym[poloPropertyDecoratorSymbol].length === 1);
    assert(defBySym[poloPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === poloPropertyDecoratorSymbol && def.owner === MarcoClass).length === 0);
    assert(defBySym[poloPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === poloPropertyDecoratorSymbol && def.owner === PoloClass).length === 1);
    // Get explicit decorator definitions for the extended class
    const polooPropertyDecoratorDefinition = getDecoratedClassPropertyDecoratorDefinition(polo, 'prop', decoPropertyDecoratorSymbol);
    // Verify base class property decorators were both inherited and added when searching for an explicit class decorator
    assert(polooPropertyDecoratorDefinition.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 2);
  }

  // Class decorators are present on base class
  it('Class decorators are present on base class', () => testMarcoClassDecorators(marco));
  // Class property decorators are present on base class
  it('Class property decorators are present on base class', () => testMarcoClassPropertyDecorators(marco));

  // Class decorators are inherited when extending a class
  it('Class decorators are inherited when extending a class', () => testPoloClassDecorators(polo));
  // Class property decorators are inherited when extending a class
  it('Class property decorators are inherited when extending a class', () => testPoloClassPropertyDecorators(polo));

  // Class decorators are inherited when enttifying a class
  it('Class decorators are inherited when enttifying a class', () => testMarcoClassDecorators(enttifiedMarco));
  // Class property decorators are inherited when enttifying a class
  it('Class property decorators are inherited when enttifying a class', () => testMarcoClassPropertyDecorators(enttifiedMarco));

  // Class decorators are inherited when enttifying an extended class
  it('Class decorators are inherited when enttifying an extended class', () => testPoloClassDecorators(enttifiedPolo));
  // Class property decorators are inherited when enttifying an extended class
  it('Class property decorators are inherited when enttifying an extended class', () => testPoloClassPropertyDecorators(enttifiedPolo));

  // Class decorators are inherited when extending an enttified class
  it('Class decorators are inherited when extending an enttified class', () => testMarcoClassDecorators(extendedEnttifiedMarco));
  // Class property decorators are inherited when extending an enttified class
  it('Class property decorators are inherited when extending an enttified class', () => testMarcoClassPropertyDecorators(extendedEnttifiedMarco));

  // Class decorators are inherited when extending an enttified, previously extended class
  it('Class decorators are inherited when extending an enttified, previously extended class', () => testPoloClassDecorators(extendedEnttifiedPolo));
  // Class property decorators are inherited when extending an enttified, previously extended class
  it('Class property decorators are inherited when extending an enttified, previously extended class', () =>
    testPoloClassPropertyDecorators(extendedEnttifiedPolo));
}
