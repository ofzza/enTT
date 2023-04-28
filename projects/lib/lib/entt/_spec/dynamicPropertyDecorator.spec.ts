// Dynamic property decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import {
  Info,
  Warning,
  createPropertyCustomDecorator,
  getDecoratedClassPropertyDecoratorDefinition,
  enttify,
  getUnderlyingEnttifiedInstance,
  verifyDecoratorUsage,
} from '../';

// Set minimal expected number of instantiations performed per second
const INSTANTIATIONS_PER_SECOND = 10000;
// Set how many times slowed instantiation of an EnTTified class is allowed to be compared to plain class
const ENTTITIFICATION_SLOWDOWN_FACTOR = 100;

// Holds warnings thrown by `verifyDecoratorUsage()` calls, out in public for test inspection purposes
const warnings: Array<Info | Warning | Error> = [];

// Unique identifier symbol identifying the NumericDateValue decorator
const numericDateValueDecoratorSymbol = Symbol('Numeric date value property decorator');
/**
 * Makes sure a numeric property is represented as a date
 * @returns Property decorator
 */
function NumericDateValue() {
  return createPropertyCustomDecorator<object, boolean, number, Date>(
    {
      composeDecoratorDefinitionPayload: () => true,
      onPropertyGet: ({ value }): Date => new Date(value),
      onPropertySet: ({ target, key, value }) => value.getTime(),
    },
    numericDateValueDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the NumericDateValue decorator
const stringDateValueDecoratorSymbol = Symbol('String date value property decorator');
/**
 * Makes sure a numeric property is represented as a date
 * @returns Property decorator
 */
function StringDateValue() {
  return createPropertyCustomDecorator<object, boolean, string, Date>(
    {
      composeDecoratorDefinitionPayload: () => true,
      onPropertyGet: ({ value }): Date => new Date(value),
      onPropertySet: ({ target, key, value }) => value.toISOString(),
    },
    stringDateValueDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the AddToValue decorator
const addToValueDecoratorSymbol = Symbol('Add to value property decorator');
/**
 * Makes sure a numeric property is represented as a date
 * @param addend Diff to increate the value by
 * @returns Property decorator
 */
function AddToValue(addend: number = 1) {
  return createPropertyCustomDecorator<object, boolean, number, number>(
    {
      composeDecoratorMultipleUsagePermission: () => true,
      onPropertyGet: ({ value }): number => value + addend,
      onPropertySet: ({ target, key, value }) => value - addend,
    },
    addToValueDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the MultiplyValue decorator
const multiplyValueDecoratorSymbol = Symbol('Multiply value property decorator');
/**
 * Makes sure a numeric property is represented as a date
 * @param factor Factor to multiply the value by
 * @returns Property decorator
 */
function MultiplyValue(factor: number = 2) {
  return createPropertyCustomDecorator<object, boolean, number, number>(
    {
      composeDecoratorMultipleUsagePermission: () => true,
      onPropertyGet: ({ value }): number => value * factor,
      onPropertySet: ({ target, key, value }) => value / factor,
    },
    multiplyValueDecoratorSymbol,
  );
}

// Export tests
export function testDynamicPropertyDecorators() {
  // Define a class for testing property dynamic decorator
  class _Timestamped {
    // Property that is internally a string, but externally a Date
    @StringDateValue()
    public created: Date = new Date();
    // Property that is internally a number, but externally a Date
    @NumericDateValue()
    public modified: Date = new Date();
  }

  // Define a class for testing decorator stacking
  class _Numerics {
    @AddToValue(1)
    @AddToValue(2)
    @MultiplyValue(3)
    @MultiplyValue(4)
    public first = 36;

    @AddToValue(1)
    @MultiplyValue(2)
    @AddToValue(3)
    @MultiplyValue(4)
    public second = 20;

    @MultiplyValue(1)
    @AddToValue(2)
    @MultiplyValue(3)
    @AddToValue(4)
    public third = 10;
  }

  describe('EnTTification', () => {
    // Check if dynamic decorators throwing warnings when parent class not EnTTified
    it('Dynamic decorators are registered as such and will report if parent class is not EnTTified', () => {
      let timestampedWarnings: Array<Error | Warning | Info> = [];

      // Check dynamic decorators throwing warnings when parent class not EnTTified
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      timestampedWarnings = warnings.filter(w => w.message.includes('_Timestamped'));
      assert(timestampedWarnings.length === 2);
      assert(timestampedWarnings[0] !== timestampedWarnings[1]);

      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);

      // Check dynamic decorators no longer throwing warnings
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      timestampedWarnings = warnings.filter(w => w.message.includes('_Timestamped'));
      assert(timestampedWarnings.length === 0);
    });

    // Check if using EnTTified classes is performant
    it('Enttitified class with dynamic decorators is performant', () => {
      // Perform as many instantiations as possible in 100ms
      let countPlain = 0;
      const startEnttified = Date.now();
      while (!(countPlain % 1000 === 0 && Date.now() - startEnttified >= 100)) {
        const timestamped = new _Timestamped();
        countPlain++;
      }
      const plainInstantiationsPerSecond = (1000 * countPlain) / (Date.now() - startEnttified);

      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);

      // Perform as many instantiations as possible in 100ms
      let countEnttified = 0;
      const startPlain = Date.now();
      while (!(countEnttified % 1000 === 0 && Date.now() - startPlain >= 100)) {
        const timestamped = new Timestamped();
        countEnttified++;
      }
      const enttifiedInstantiationsPerSecond = (1000 * countEnttified) / (Date.now() - startPlain);

      // Check number of instantiations per second
      assert(plainInstantiationsPerSecond > INSTANTIATIONS_PER_SECOND);
      assert(enttifiedInstantiationsPerSecond > INSTANTIATIONS_PER_SECOND);
      assert(plainInstantiationsPerSecond / enttifiedInstantiationsPerSecond < ENTTITIFICATION_SLOWDOWN_FACTOR);
    });

    // Check if decorator definitions are set correctly
    it('Definitions are set correctly', () => {
      // Check if decorator definitions set properly for @StringDateValue()
      const strDefinition = getDecoratedClassPropertyDecoratorDefinition(_Timestamped, 'created', stringDateValueDecoratorSymbol);
      assert(!!strDefinition);
      assert(strDefinition.length === 1);
      assert(strDefinition[0].owner === _Timestamped);
      assert(strDefinition[0].ownerPropertyKey === 'created');
      assert(strDefinition[0].decoratorSymbol === stringDateValueDecoratorSymbol);
      assert(strDefinition[0].data === true);
      // Check if decorator definitions set properly for @NumericDateValue()
      const numDefinition = getDecoratedClassPropertyDecoratorDefinition(_Timestamped, 'modified', numericDateValueDecoratorSymbol);
      assert(!!numDefinition);
      assert(numDefinition.length === 1);
      assert(numDefinition[0].owner === _Timestamped);
      assert(numDefinition[0].ownerPropertyKey === 'modified');
      assert(numDefinition[0].decoratorSymbol === numericDateValueDecoratorSymbol);
      assert(numDefinition[0].data === true);
    });
    // Check if decorator definitions are set correctly
    it('Definitions are set correctly and can be reached via enttified class', () => {
      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);

      // Check if decorator definitions set properly for @StringDateValue()
      const strDefinition = getDecoratedClassPropertyDecoratorDefinition(Timestamped, 'created', stringDateValueDecoratorSymbol);
      assert(!!strDefinition);
      assert(strDefinition.length === 1);
      assert(strDefinition[0].owner === _Timestamped);
      assert(strDefinition[0].ownerPropertyKey === 'created');
      assert(strDefinition[0].decoratorSymbol === stringDateValueDecoratorSymbol);
      assert(strDefinition[0].data === true);
      // Check if decorator definitions set properly for @NumericDateValue()
      const numDefinition = getDecoratedClassPropertyDecoratorDefinition(Timestamped, 'modified', numericDateValueDecoratorSymbol);
      assert(!!numDefinition);
      assert(numDefinition.length === 1);
      assert(numDefinition[0].owner === _Timestamped);
      assert(numDefinition[0].ownerPropertyKey === 'modified');
      assert(numDefinition[0].decoratorSymbol === numericDateValueDecoratorSymbol);
      assert(numDefinition[0].data === true);
    });
    // Check if decorator definitions are set correctly
    it('Definitions are set correctly and can be reached via enttified class instance', () => {
      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);
      const timestamped = new Timestamped();

      // Check if decorator definitions set properly for @StringDateValue()
      const strDefinition = getDecoratedClassPropertyDecoratorDefinition(timestamped, 'created', stringDateValueDecoratorSymbol);
      assert(!!strDefinition);
      assert(strDefinition.length === 1);
      assert(strDefinition[0].owner === _Timestamped);
      assert(strDefinition[0].ownerPropertyKey === 'created');
      assert(strDefinition[0].decoratorSymbol === stringDateValueDecoratorSymbol);
      assert(strDefinition[0].data === true);
      // Check if decorator definitions set properly for @NumericDateValue()
      const numDefinition = getDecoratedClassPropertyDecoratorDefinition(timestamped, 'modified', numericDateValueDecoratorSymbol);
      assert(!!numDefinition);
      assert(numDefinition.length === 1);
      assert(numDefinition[0].owner === _Timestamped);
      assert(numDefinition[0].ownerPropertyKey === 'modified');
      assert(numDefinition[0].decoratorSymbol === numericDateValueDecoratorSymbol);
      assert(numDefinition[0].data === true);
    });

    // Check if decorator definitions can be used multiple times only if explicitly permitted
    it('Dynamic decorators can only be used multiple times on the same target when explicitly permitted', () => {
      // Test if forbidden multiple usages of not permitted decorator on same property
      expect(() => {
        class Test {
          @StringDateValue()
          @StringDateValue()
          public property!: any;
        }
      }).toThrow();
      // Test if allowed multiple usages of permitted decorator on same property
      expect(() => {
        class Test {
          @MultiplyValue(1)
          @MultiplyValue(1)
          public property!: any;
        }
      }).not.toThrow();
    });

    // Check underlying instance of EnTTified object accessible and dynamic decorators correctly hooking into property setters/getters
    it('Dynamic decorators correctly hooking into property setters/getters', () => {
      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);

      // Initialize EnTTified class instance
      const timestamped = new Timestamped();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(timestamped);

      // Verify dynamic decorator intercepts property getters/setters during instance construction
      assert(timestamped.created instanceof Date);
      assert(timestamped.modified instanceof Date);
      assert(typeof underlying.created === 'string');
      assert(typeof underlying.modified === 'number');

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      timestamped.created = new Date();
      timestamped.modified = new Date();
      assert(timestamped.created instanceof Date);
      assert(timestamped.modified instanceof Date);
      assert(typeof underlying.created === 'string');
      assert(typeof underlying.modified === 'number');

      // Verify dynamic decorator intercepts property getters/setters after underlying instance property value assignment
      underlying.created = new Date().toISOString() as unknown as Date;
      underlying.modified = new Date().getTime() as unknown as Date;
      assert(timestamped.created instanceof Date);
      assert(timestamped.modified instanceof Date);
      assert(typeof underlying.created === 'string');
      assert(typeof underlying.modified === 'number');
    });

    // Check dynamic decorators can be stacked and will intercept getters/setters in order they were added to the property in
    it('Dynamic decorators can be stacked and preserve definition order', () => {
      // EnTTify parent class
      const Numerics = enttify(_Numerics);

      // Initialize EnTTified class instance
      const numerics = new Numerics();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(numerics);

      // Verify dynamic decorator intercepts property getters/setters during instance construction
      assert(numerics.first === 36);
      assert(underlying.first === 0);
      assert(numerics.second === 20);
      assert(underlying.second === 0);
      assert(numerics.third === 10);
      assert(underlying.third === 0);

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      numerics.first = 48;
      assert(numerics.first === 48);
      assert(underlying.first === 1);
      numerics.second = 28;
      assert(numerics.second === 28);
      assert(underlying.second === 1);
      numerics.third = 13;
      assert(numerics.third === 13);
      assert(underlying.third === 1);

      // Verify dynamic decorator intercepts property getters/setters after underlying instance property value assignment
      underlying.first = 2;
      assert(numerics.first === 60);
      assert(underlying.first === 2);
      underlying.second = 2;
      assert(numerics.second === 36);
      assert(underlying.second === 2);
      underlying.third = 2;
      assert(numerics.third === 16);
      assert(underlying.third === 2);
    });
  });
}
