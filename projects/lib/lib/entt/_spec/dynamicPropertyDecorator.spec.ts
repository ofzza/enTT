// Dynamic property decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { Info, Warning, createPropertyCustomDecorator, enttify, getUnderlyingEnttifiedInstance, verifyDecoratorUsage } from '../';

// Holds warnings thrown by `verifyDecoratorUsage()` calls, out in public for test inspection purposes
const warnings: (Info | Warning | Error)[] = [];

// Unique identifier symbol identifying the NumericDateValue decorator
const numericDateValueDecoratorSymbol = Symbol('Numeric date value property decorator');
/**
 * Makes sure a numberic property is represented as a date
 * @returns Property decorator
 */
function NumericDateValue() {
  return createPropertyCustomDecorator(
    {
      onPropertyGet: (value: number): Date => new Date(value),
      onPropertySet: ({ target, key, value }) => value.getTime(),
    },
    numericDateValueDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the NumericDateValue decorator
const stringDateValueDecoratorSymbol = Symbol('Numeric date value property decorator');
/**
 * Makes sure a numberic property is represented as a date
 * @returns Property decorator
 */
function StringDateValue() {
  return createPropertyCustomDecorator(
    {
      onPropertyGet: (value: string): Date => new Date(value),
      onPropertySet: ({ target, key, value }) => value.toISOString(),
    },
    stringDateValueDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the AddOneValue decorator
const addOneDecoratorSymbol = Symbol('Add One property decorator');
/**
 * Makes sure a numberic property is represented as a date
 * @returns Property decorator
 */
function AddOneValue() {
  return createPropertyCustomDecorator(
    {
      onPropertyGet: (value: number): number => {
        return value + 1;
      },
      onPropertySet: ({ target, key, value }) => value - 1,
    },
    addOneDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the TimesTwoValue decorator
const timesTwoDecoratorSymbol = Symbol('Times Two property decorator');
/**
 * Makes sure a numberic property is represented as a date
 * @returns Property decorator
 */
function TimesTwoValue() {
  return createPropertyCustomDecorator(
    {
      onPropertyGet: (value: number): number => {
        return value * 2;
      },
      onPropertySet: ({ target, key, value }) => value / 2,
    },
    timesTwoDecoratorSymbol,
  );
}

// Export tests
export function testsDynamicPropertyDecorators() {
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
    @AddOneValue()
    @AddOneValue()
    @TimesTwoValue()
    @TimesTwoValue()
    public eight = 8;

    @AddOneValue()
    @TimesTwoValue()
    @AddOneValue()
    @TimesTwoValue()
    public six = 6;

    @TimesTwoValue()
    @AddOneValue()
    @TimesTwoValue()
    @AddOneValue()
    public three = 3;
  }

  describe('EnTTification', () => {
    // Check if dynamic decorators throwing warnings when parent class not EnTTified
    it('Dynamic decorators are registered as such and will report if parent class is not EnTTified', () => {
      // Check dynamic decorators throwing warnings when parent class not EnTTified
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      assert(warnings.filter(w => w.message.includes('_Timestamped')).length === 2);
      assert(warnings[0] !== warnings[1]);

      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);

      // Check dynamic decorators no longer throwing warnings
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      assert(warnings.filter(w => w.message.includes('_Timestamped')).length === 0);
    });

    // Check underlying instance of EnTTified object accessible and dynamic decorators correctly hooking into property setters/getters
    it('Dynamic decorators correctly hooking into property setters/getters', () => {
      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);

      // Initialize EnTTified class instance
      const notification = new Timestamped();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(notification);

      // Verify dynamic decorator intercepts property getters/setters during instance construction
      assert(notification.created instanceof Date);
      assert(notification.modified instanceof Date);
      assert(typeof underlying.created === 'string');
      assert(typeof underlying.modified === 'number');

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      notification.created = new Date();
      notification.modified = new Date();
      assert(notification.created instanceof Date);
      assert(notification.modified instanceof Date);
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
      assert(numerics.eight === 8);
      assert(underlying.eight === 0);
      assert(numerics.six === 6);
      assert(underlying.six === 0);
      assert(numerics.three === 3);
      assert(underlying.three === 0);

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      numerics.eight = 12;
      assert(numerics.eight === 12);
      assert(underlying.eight === 1);
      numerics.six = 14;
      assert(numerics.six === 14);
      assert(underlying.six === 2);
      numerics.three = 11;
      assert(numerics.three === 11);
      assert(underlying.three === 2);

      // Verify dynamic decorator intercepts property getters/setters after underlying instance property value assignment
      underlying.eight = 5;
      assert(numerics.eight === 28);
      assert(underlying.eight === 5);
      underlying.six = 5;
      assert(numerics.six === 26);
      assert(underlying.six === 5);
      underlying.three = 5;
      assert(numerics.three === 23);
      assert(underlying.three === 5);
    });
  });
}
