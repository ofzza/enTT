// Dynamic property decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// TODO:
// - Write tests for onGet staged configuration
// - Write tests for onSet staged configuration
// - Write tests for onSet interceptor configuration

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { ClassInstance } from '@ofzza/ts-std/types/corejs/class';
import {
  Info,
  Warning,
  createPropertyCustomDecorator,
  getDecoratedClassPropertyDecoratorDefinition,
  EnttClassInstance,
  OnPropertyInterceptionCallback,
  OnPropertyTransformationCallback,
  enttify,
  getUnderlyingEnttifiedInstance,
  verifyDecoratorUsage,
} from '../';
import { def } from '../../../decorators';

// #region Fixtures

// Set minimal expected number of instantiations performed per second
const INSTANTIATIONS_PER_SECOND = 10000;
// Set how many times slowed instantiation of an EnTTified class is allowed to be compared to plain class
const ENTTITIFICATION_SLOWDOWN_FACTOR = 100;

// Holds warnings thrown by `verifyDecoratorUsage()` calls, out in public for test inspection purposes
const warnings: Array<Info | Warning | Error> = [];

// Unique identifier symbol identifying the TapProperty decorator
const tapPropertyDecoratorSymbol = Symbol('Tap property decorator');
// Taps a property hooks by piping all internal callbacks
function TapProperty<TInstance extends EnttClassInstance<ClassInstance>, TValInner = any, TValOuter = any>(callbacks: {
  beforeGet: OnPropertyInterceptionCallback<TInstance, TValInner>;
  transformGet: OnPropertyTransformationCallback<TInstance, TValInner, TValOuter>;
  afterGet: OnPropertyInterceptionCallback<TInstance, TValInner>;
  beforeSet: OnPropertyInterceptionCallback<TInstance, TValInner>;
  transformSet: OnPropertyTransformationCallback<TInstance, TValOuter, TValInner>;
  afterSet: OnPropertyInterceptionCallback<TInstance, TValInner>;
}) {
  return createPropertyCustomDecorator<TInstance, any, any, any>(
    {
      composeDecoratorDefinitionPayload: () => callbacks,
      onPropertyGet: {
        before: v => callbacks.beforeGet(v),
        transform: v => callbacks.transformGet(v),
        after: v => callbacks.afterGet(v),
      },
      onPropertySet: {
        before: v => callbacks.beforeSet(v),
        transform: v => callbacks.transformSet(v),
        after: v => callbacks.afterSet(v),
      },
    },
    tapPropertyDecoratorSymbol,
  );
}

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

// #endregion

// #region Tests

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
    // Initialze warnings output
    let timestampedWarnings: Array<Error | Warning | Info> = [];
    let noTimestampedWarnings: Array<Error | Warning | Info> = [];

    // Check dynamic decorators throwing warnings when parent class not EnTTified
    warnings.splice(0, warnings.length);
    verifyDecoratorUsage((msg: any) => warnings.push(msg));
    timestampedWarnings = warnings.filter(w => w.message.includes('_Timestamped'));

    // EnTTify parent class
    const Timestamped = enttify(_Timestamped);

    // Check dynamic decorators no longer throwing warnings
    warnings.splice(0, warnings.length);
    verifyDecoratorUsage((msg: any) => warnings.push(msg));
    noTimestampedWarnings = warnings.filter(w => w.message.includes('_Timestamped'));

    it('Dynamic decorators are registered as such and will report if parent class is not EnTTified', () => {
      assert(timestampedWarnings.length === 2);
      assert(timestampedWarnings[0] !== timestampedWarnings[1]);
      assert(noTimestampedWarnings.length === 0);
    });

    describe('Enttitified class with dynamic decorators is performant', () => {
      // Perform as many instantiations as possible in 100ms
      let countPlain = 0;
      const startEnttified = performance.now();
      while (!(countPlain % 1000 === 0 && performance.now() - startEnttified >= 100)) {
        const timestamped = new _Timestamped();
        countPlain++;
      }
      const plainInstantiationsPerSecond = (1000 * countPlain) / (performance.now() - startEnttified);

      // EnTTify parent class
      const Timestamped = enttify(_Timestamped);

      // Perform as many instantiations as possible in 100ms
      let countEnttified = 0;
      const startPlain = performance.now();
      while (!(countEnttified % 1000 === 0 && performance.now() - startPlain >= 100)) {
        const timestamped = new Timestamped();
        countEnttified++;
      }
      const enttifiedInstantiationsPerSecond = (1000 * countEnttified) / (performance.now() - startPlain);

      // Claculate slowdown factor
      const slowdown = plainInstantiationsPerSecond / enttifiedInstantiationsPerSecond;

      // Check number of instantiations per second
      it(`Can perform >${INSTANTIATIONS_PER_SECOND} non-enttified instantiations/sec (${Math.round(plainInstantiationsPerSecond)})`, () => {
        assert(plainInstantiationsPerSecond > INSTANTIATIONS_PER_SECOND);
      });
      it(`Can perform >${INSTANTIATIONS_PER_SECOND} enttified instantiations/sec (${Math.round(enttifiedInstantiationsPerSecond)})`, () => {
        assert(enttifiedInstantiationsPerSecond > INSTANTIATIONS_PER_SECOND);
      });
      it(`Enttification slowdown factor is <${ENTTITIFICATION_SLOWDOWN_FACTOR}X (${Math.round((100 * slowdown) / 100)})`, () => {
        assert(slowdown < ENTTITIFICATION_SLOWDOWN_FACTOR);
      });
    });

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
      assert(typeof underlying!.created === 'string');
      assert(typeof underlying!.modified === 'number');

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      timestamped.created = new Date();
      timestamped.modified = new Date();
      assert(timestamped.created instanceof Date);
      assert(timestamped.modified instanceof Date);
      assert(typeof underlying!.created === 'string');
      assert(typeof underlying!.modified === 'number');

      // Verify dynamic decorator intercepts property getters/setters after underlying instance property value assignment
      underlying!.created = new Date().toISOString() as unknown as Date;
      underlying!.modified = new Date().getTime() as unknown as Date;
      assert(timestamped.created instanceof Date);
      assert(timestamped.modified instanceof Date);
      assert(typeof underlying!.created === 'string');
      assert(typeof underlying!.modified === 'number');
    });

    it('Dynamic decorators correctly hooking into staged property setters/getters', () => {
      // Example class
      class _Example {
        @def
        @TapProperty({
          beforeGet: v => events.push({ event: 'get:before', target: v.target, data: { key: v.key, value: v.value } }),
          transformGet: v => {
            events.push({ event: 'get:transform', target: v.target, data: { key: v.key, value: v.value } });
            return v.value;
          },
          afterGet: v => events.push({ event: 'get:after', target: v.target, data: { key: v.key, value: v.value } }),
          beforeSet: v => events.push({ event: 'set:before', target: v.target, data: { key: v.key, value: v.value } }),
          transformSet: v => {
            events.push({ event: 'set:transform', target: v.target, data: { key: v.key, value: v.value } });
            return v.value;
          },
          afterSet: v => events.push({ event: 'set:after', target: v.target, data: { key: v.key, value: v.value } }),
        })
        public value: string = 'testing';
      }
      // EnTTify parent class
      const Example = enttify(_Example);

      // Holds intercepted events from any instance of the Example class
      const events: Array<{ event: string; target: EnttClassInstance<ClassInstance>; data?: any }> = [];

      // Initialize EnTTified class instance
      const example = new Example();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(example);

      // Verify initialization events were intercepted
      assert(events.length === 3);
      assert(events[0].event === 'set:before'); // Before setting initial value of the `.value` property
      assert(events[0].target === underlying);
      assert(events[0].data.key === 'value');
      assert(events[0].data.value === 'testing');
      assert(events[1].event === 'set:transform'); // Transformation while setting initial value of the `.value` property
      assert(events[1].target === underlying);
      assert(events[1].data.key === 'value');
      assert(events[1].data.value === 'testing');
      assert(events[2].event === 'set:after'); // After setting initial value of the `.value` property
      assert(events[2].target === underlying);
      assert(events[2].data.key === 'value');
      assert(events[2].data.value === 'testing');

      // Get value
      example.value;
      assert(events.length === 6);
      assert(events[3].event === 'get:before'); // Before getting initial value of the `.value` property
      assert(events[3].target === underlying);
      assert(events[3].data.key === 'value');
      assert(events[3].data.value === 'testing');
      assert(events[4].event === 'get:transform'); // Transformation while getting initial value of the `.value` property
      assert(events[4].target === underlying);
      assert(events[4].data.key === 'value');
      assert(events[4].data.value === 'testing');
      assert(events[5].event === 'get:after'); // After getting initial value of the `.value` property
      assert(events[5].target === underlying);
      assert(events[5].data.key === 'value');
      assert(events[5].data.value === 'testing');

      // Set value
      example.value = 'still testing';
      assert(events.length === 9);
      assert(events[6].event === 'set:before'); // Before setting initial value of the `.value` property
      assert(events[6].target === underlying);
      assert(events[6].data.key === 'value');
      assert(events[6].data.value === 'still testing');
      assert(events[7].event === 'set:transform'); // Transformation while setting initial value of the `.value` property
      assert(events[7].target === underlying);
      assert(events[7].data.key === 'value');
      assert(events[7].data.value === 'still testing');
      assert(events[8].event === 'set:after'); // After setting initial value of the `.value` property
      assert(events[8].target === underlying);
      assert(events[8].data.key === 'value');
      assert(events[8].data.value === 'still testing');
    });

    it('Dynamic decorators can be stacked and preserve definition order', () => {
      // EnTTify parent class
      const Numerics = enttify(_Numerics);

      // Initialize EnTTified class instance
      const numerics = new Numerics();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(numerics);

      // Verify dynamic decorator intercepts property getters/setters during instance construction
      assert(numerics.first === 36);
      assert(underlying!.first === 0);
      assert(numerics.second === 20);
      assert(underlying!.second === 0);
      assert(numerics.third === 10);
      assert(underlying!.third === 0);

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      numerics.first = 48;
      assert(numerics.first === 48);
      assert(underlying!.first === 1);
      numerics.second = 28;
      assert(numerics.second === 28);
      assert(underlying!.second === 1);
      numerics.third = 13;
      assert(numerics.third === 13);
      assert(underlying!.third === 1);

      // Verify dynamic decorator intercepts property getters/setters after underlying instance property value assignment
      underlying!.first = 2;
      assert(numerics.first === 60);
      assert(underlying!.first === 2);
      underlying!.second = 2;
      assert(numerics.second === 36);
      assert(underlying!.second === 2);
      underlying!.third = 2;
      assert(numerics.third === 16);
      assert(underlying!.third === 2);
    });
  });
}

// #endregion
