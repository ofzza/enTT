// Decorators inheritability with class inheritence TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import {
  createClassCustomDecorator,
  getDecoratedClassDefinition,
  getDecoratedClassDecoratorDefinition,
  createPropertyCustomDecorator,
  getDecoratedClassPropertyDefinition,
  getDecoratedClassPropertyDecoratorDefinition,
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

  // Class decorators are inherited
  it('Class decorators are inherited when inheriting a class', () => {
    // Get full class definition for the base class
    const marcoClassDefinition = getDecoratedClassDefinition(marco);
    const marcoClassDefinitionAll = marcoClassDefinition.decorators.all;
    const marcoClassDefinitionBySymbol = marcoClassDefinition.decorators.bySymbol;
    // Verify all decorators are present and no extended decorators have poluted the base class
    assert(marcoClassDefinitionAll.length === 2);
    assert(marcoClassDefinitionAll.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 1);
    assert(marcoClassDefinitionAll.filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol).length === 1);
    assert(marcoClassDefinitionBySymbol[decoClassDecoratorSymbol].length === 1);
    assert(marcoClassDefinitionBySymbol[decoClassDecoratorSymbol].filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 1);
    assert(marcoClassDefinitionBySymbol[marcoClassDecoratorSymbol].length === 1);
    assert(marcoClassDefinitionBySymbol[marcoClassDecoratorSymbol].filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol).length === 1);
    // Get explicit decorator definitions for the base class
    const marcoClassDecoratorDefinition = getDecoratedClassDecoratorDefinition(marco, decoClassDecoratorSymbol);
    // Verify base class decorators are present when searching for an explicit class decorator
    assert(marcoClassDecoratorDefinition.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 1);

    // Get full class definition for the extended class
    const poloClassDefinition = getDecoratedClassDefinition(polo);
    const poloClassDefinitionAll = poloClassDefinition.decorators.all;
    const poloClassDefinitionBySymbol = poloClassDefinition.decorators.bySymbol;
    // Verify all base and extended class decorators are present
    assert(poloClassDefinitionAll.length === 4);
    assert(poloClassDefinitionAll.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 2);
    assert(poloClassDefinitionAll.filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol).length === 1);
    assert(poloClassDefinitionAll.filter(def => def.decoratorSymbol === poloClassDecoratorSymbol).length === 1);
    assert(poloClassDefinitionBySymbol[decoClassDecoratorSymbol].length === 2);
    assert(poloClassDefinitionBySymbol[decoClassDecoratorSymbol].filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 2);
    assert(poloClassDefinitionBySymbol[marcoClassDecoratorSymbol].length === 1);
    assert(poloClassDefinitionBySymbol[marcoClassDecoratorSymbol].filter(def => def.decoratorSymbol === marcoClassDecoratorSymbol).length === 1);
    assert(poloClassDefinitionBySymbol[poloClassDecoratorSymbol].length === 1);
    assert(poloClassDefinitionBySymbol[poloClassDecoratorSymbol].filter(def => def.decoratorSymbol === poloClassDecoratorSymbol).length === 1);
    // Get explicit decorator definitions for the extended class
    const poloClassDecoratorDefinition = getDecoratedClassDecoratorDefinition(polo, decoClassDecoratorSymbol);
    // Verify extended class decorators were both inherited and added when searching for an explicit class decorator
    assert(poloClassDecoratorDefinition.filter(def => def.decoratorSymbol === decoClassDecoratorSymbol).length === 2);
  });

  // Class property decorators are inherited
  it('Class property decorators are inherited when inheriting a class', () => {
    // Get full class definition for the base class
    const marcoPropertyDefinition = getDecoratedClassPropertyDefinition(marco, 'prop');
    const marcoPropertyDefinitionAll = marcoPropertyDefinition.decorators.all;
    const marcoPropertyDefinitionBySymbol = marcoPropertyDefinition.decorators.bySymbol;
    // Verify all decorators are present and no extended decorators have poluted the base class
    assert(marcoPropertyDefinitionAll.length === 2);
    assert(marcoPropertyDefinitionAll.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 1);
    assert(marcoPropertyDefinitionAll.filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol).length === 1);
    assert(marcoPropertyDefinitionBySymbol[decoPropertyDecoratorSymbol].length === 1);
    assert(marcoPropertyDefinitionBySymbol[decoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 1);
    assert(marcoPropertyDefinitionBySymbol[marcoPropertyDecoratorSymbol].length === 1);
    assert(marcoPropertyDefinitionBySymbol[marcoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol).length === 1);
    // Get explicit decorator definitions for the base class
    const marcoPropertyDecoratorDefinition = getDecoratedClassPropertyDecoratorDefinition(marco, 'prop', decoPropertyDecoratorSymbol);
    // Verify base class property decorators are present when searching for an explicit class decorator
    assert(marcoPropertyDecoratorDefinition.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 1);

    // Get full class definition for the extended class
    const poloPropertyDefinition = getDecoratedClassPropertyDefinition(polo, 'prop');
    const poloPropertyDefinitionAll = poloPropertyDefinition.decorators.all;
    const poloPropertyDefinitionBySymbol = poloPropertyDefinition.decorators.bySymbol;
    // Verify all base and extended class decorators are present
    assert(poloPropertyDefinitionAll.length === 4);
    assert(poloPropertyDefinitionAll.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 2);
    assert(poloPropertyDefinitionAll.filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol).length === 1);
    assert(poloPropertyDefinitionAll.filter(def => def.decoratorSymbol === poloPropertyDecoratorSymbol).length === 1);
    assert(poloPropertyDefinitionBySymbol[decoPropertyDecoratorSymbol].length === 2);
    assert(poloPropertyDefinitionBySymbol[decoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 2);
    assert(poloPropertyDefinitionBySymbol[marcoPropertyDecoratorSymbol].length === 1);
    assert(poloPropertyDefinitionBySymbol[marcoPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === marcoPropertyDecoratorSymbol).length === 1);
    assert(poloPropertyDefinitionBySymbol[poloPropertyDecoratorSymbol].length === 1);
    assert(poloPropertyDefinitionBySymbol[poloPropertyDecoratorSymbol].filter(def => def.decoratorSymbol === poloPropertyDecoratorSymbol).length === 1);
    // Get explicit decorator definitions for the extended class
    const polooPropertyDecoratorDefinition = getDecoratedClassPropertyDecoratorDefinition(polo, 'prop', decoPropertyDecoratorSymbol);
    // Verify base class property decorators were both inherited and added when searching for an explicit class decorator
    assert(polooPropertyDecoratorDefinition.filter(def => def.decoratorSymbol === decoPropertyDecoratorSymbol).length === 2);
  });
}
