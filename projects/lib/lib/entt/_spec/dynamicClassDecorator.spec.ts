// Dynamic class decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert, refute } from '@ofzza/ts-std/types/utility/assertion';
import { ClassInstance } from '@ofzza/ts-std/types/corejs/class';
import {
  Info,
  Warning,
  createClassCustomDecorator,
  getDecoratedClassDecoratorDefinition,
  EnttClassInstance,
  FullPathPropertyValue,
  OnConstructorCallback,
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
const ENTTITIFICATION_SLOWDOWN_FACTOR = 2000;

// Holds warnings thrown by `verifyDecoratorUsage()` calls, out in public for test inspection purposes
const warnings: Array<Info | Warning | Error> = [];

// Unique identifier symbol identifying the TapClassConstructorAndProperties decorator
const tapClassConstructorAndPropertiesDecoratorSymbol = Symbol('Tap class constructor and properties decorator');
// Taps a property hooks by piping constructor and property getter/setter callbacks
function TapClassConstructorAndProperties<TInstance extends ClassInstance, TValInner = any, TValOuter = any>(callbacks: {
  construct: OnConstructorCallback<TInstance>;
  beforeGet: OnPropertyInterceptionCallback<TInstance, TValInner>;
  transformGet: OnPropertyTransformationCallback<TInstance, TValInner, TValOuter>;
  afterGet: OnPropertyInterceptionCallback<TInstance, TValInner>;
  beforeSet: OnPropertyInterceptionCallback<TInstance, TValInner>;
  transformSet: OnPropertyTransformationCallback<TInstance, TValOuter, TValInner>;
  afterSet: OnPropertyInterceptionCallback<TInstance, TValInner>;
}) {
  return createClassCustomDecorator<TInstance, any>(
    {
      composeDecoratorDefinitionPayload: () => callbacks,
      onConstruct: instance => callbacks.construct(instance),
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
    tapClassConstructorAndPropertiesDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the TapClassPropertyQuerying decorator
const tapClassPropertyQueryingDecoratorSymbol = Symbol('Tap class property querying decorator');
// Taps a property hooks by piping property querying callbacks
function TapClassPropertyQuerying<TInstance extends ClassInstance>(callbacks: {
  has: (instance: EnttClassInstance<TInstance>, key: PropertyKey) => boolean;
  ownKeys: (instance: EnttClassInstance<TInstance>) => Array<string | symbol>;
}) {
  return createClassCustomDecorator<TInstance, any>(
    {
      composeDecoratorDefinitionPayload: () => callbacks,
      onPropertyKeys: {
        has: (instance: EnttClassInstance<TInstance>, key: PropertyKey) => callbacks.has(instance, key),
        ownKeys: (instance: EnttClassInstance<TInstance>) => callbacks.ownKeys(instance),
      },
    },
    tapClassPropertyQueryingDecoratorSymbol,
  );
}

// Holds all instances of classes decorated with `@RegisterInstance()`
const registeredInstances: Array<ClassInstance> = [];

// Unique identifier symbol identifying the RegisterInstance decorator
const registerInstanceDecoratorSymbol = Symbol('Register instance decorator');
/**
 * Makes sure every instance is registered into a central static repository while it is being constructed
 * @returns Class decorator
 */
function RegisterInstance() {
  return createClassCustomDecorator(
    {
      composeDecoratorDefinitionPayload: () => true,
      onConstruct: (instance: ClassInstance) => registeredInstances.push(instance),
    },
    registerInstanceDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the StringTitleCase decorator
const stringTitleCaseDecoratorSymbol = Symbol('String title case class decorator');
/**
 * Makes sure all string properties are stored as lower case string and are presented as title cased
 * @returns Class decorator
 */
function StringTitleCase() {
  return createClassCustomDecorator(
    {
      composeDecoratorDefinitionPayload: () => true,
      onPropertyGet: (v: FullPathPropertyValue<object, any>): any =>
        typeof v.value === 'string'
          ? v.value
              .split(' ')
              .map(s => (s.length <= 1 ? s.toUpperCase() : `${s[0].toUpperCase()}${s.substring(1)}`))
              .join(' ')
          : v.value,
      onPropertySet: (v: FullPathPropertyValue<object, any>): any =>
        typeof v.value === 'string'
          ? v.value
              .split(' ')
              .map(s => s.toLowerCase())
              .join(' ')
          : v.value,
    },
    stringTitleCaseDecoratorSymbol,
  );
}
// Unique identifier symbol identifying the SimonSays decorator
const simonSaysDecoratorSymbol = Symbol('Simon says class decorator');
/**
 * Makes sure all string properties are stored as lower case string and are presented as title cased
 * @returns Class decorator
 */
function SimonSays(name: string) {
  return createClassCustomDecorator(
    {
      composeDecoratorDefinitionPayload: () => name,
      composeDecoratorMultipleUsagePermission: () => true,
      onPropertyGet: (v: FullPathPropertyValue<object, any>): any => (typeof v.value === 'string' ? `${name} says: ${v.value}` : v.value),
      onPropertySet: (v: FullPathPropertyValue<object, any>): any =>
        typeof v.value === 'string' && v.value.startsWith(`${name} says: `) ? v.value.substr(`${name} says: `.length) : v.value,
    },
    simonSaysDecoratorSymbol,
  );
}

// #endregion

// #region Tests

export function testDynamicClassDecorators() {
  @RegisterInstance()
  @StringTitleCase()
  class _Family {
    @def public father: string = 'homer j simpson';
    @def public mother: string = 'marge simpson';
    @def public child: string = 'bart el barto simpson';
  }

  @SimonSays('Apu')
  @SimonSays('Homer')
  @SimonSays('Moe')
  @SimonSays('Mr. Burns')
  class _Quotes {
    @def public quote = `Everything's coming up Milhouse.`;
  }

  describe('EnTTification', () => {
    // Initialze warnings output
    let familyWarnings: Array<Error | Warning | Info> = [];
    let noFamilyWarnings: Array<Error | Warning | Info> = [];

    // Check dynamic decorators throwing warnings when parent class not EnTTified
    warnings.splice(0, warnings.length);
    verifyDecoratorUsage((msg: any) => warnings.push(msg));
    familyWarnings = warnings.filter(w => w.message.includes('_Family'));

    // EnTTify parent class
    const _ = enttify(_Family);

    // Check dynamic decorators no longer throwing warnings
    warnings.splice(0, warnings.length);
    verifyDecoratorUsage((msg: any) => warnings.push(msg));
    noFamilyWarnings = warnings.filter(w => w.message.includes('_Family'));

    it('Dynamic decorators are registered as such and will report if parent class is not EnTTified', () => {
      assert(familyWarnings.length === 2);
      assert(noFamilyWarnings.length === 0);
    });

    describe('Enttitified class with dynamic decorators is performant', () => {
      // Perform as many instantiations as possible in 100ms
      let countPlain = 0;
      const startEnttified = performance.now();
      while (!(countPlain % 1000 === 0 && performance.now() - startEnttified >= 100)) {
        const family = new _Family();
        countPlain++;
      }
      const plainInstantiationsPerSecond = (1000 * countPlain) / (performance.now() - startEnttified);

      // EnTTify parent class
      const Family = enttify(_Family);

      // Perform as many instantiations as possible in 100ms
      let countEnttified = 0;
      const startPlain = performance.now();
      while (!(countEnttified % 1000 === 0 && performance.now() - startPlain >= 100)) {
        const family = new Family();
        countEnttified++;
      }
      const enttifiedInstantiationsPerSecond = (1000 * countEnttified) / (performance.now() - startPlain);

      // Claculate slowdown factor
      const slowdown = plainInstantiationsPerSecond / enttifiedInstantiationsPerSecond;

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
      // Check if decorator definitions set properly for @RegisterInstance()
      const definitionA = getDecoratedClassDecoratorDefinition(_Family, registerInstanceDecoratorSymbol);
      assert(!!definitionA);
      assert(definitionA.length === 1);
      assert(definitionA[0].owner === _Family);
      assert(definitionA[0].decoratorSymbol === registerInstanceDecoratorSymbol);
      assert(definitionA[0].data === true);
      // Check if decorator definitions set properly for @StringTitleCase()
      const definitionB = getDecoratedClassDecoratorDefinition(_Family, stringTitleCaseDecoratorSymbol);
      assert(!!definitionB);
      assert(definitionB.length === 1);
      assert(definitionB[0].owner === _Family);
      assert(definitionB[0].decoratorSymbol === stringTitleCaseDecoratorSymbol);
      assert(definitionB[0].data === true);
    });

    it('Definitions are set correctly and can be reached via enttified class', () => {
      // EnTTify parent class
      const Family = enttify(_Family);

      // Check if decorator definitions set properly for @RegisterInstance()
      const definitionA = getDecoratedClassDecoratorDefinition(Family, registerInstanceDecoratorSymbol);
      assert(!!definitionA);
      assert(definitionA.length === 1);
      assert(definitionA[0].owner === _Family);
      assert(definitionA[0].decoratorSymbol === registerInstanceDecoratorSymbol);
      assert(definitionA[0].data === true);
      // Check if decorator definitions set properly for @StringTitleCase()
      const definitionB = getDecoratedClassDecoratorDefinition(Family, stringTitleCaseDecoratorSymbol);
      assert(!!definitionB);
      assert(definitionB.length === 1);
      assert(definitionB[0].owner === _Family);
      assert(definitionB[0].decoratorSymbol === stringTitleCaseDecoratorSymbol);
      assert(definitionB[0].data === true);
    });

    it('Definitions are set correctly and can be reached via enttified class instance', () => {
      // EnTTify parent class
      const Family = enttify(_Family);
      const family = new Family();

      // Check if decorator definitions set properly for @RegisterInstance()
      const definitionA = getDecoratedClassDecoratorDefinition(family, registerInstanceDecoratorSymbol);
      assert(!!definitionA);
      assert(definitionA.length === 1);
      assert(definitionA[0].owner === _Family);
      assert(definitionA[0].decoratorSymbol === registerInstanceDecoratorSymbol);
      assert(definitionA[0].data === true);
      // Check if decorator definitions set properly for @StringTitleCase()
      const definitionB = getDecoratedClassDecoratorDefinition(family, stringTitleCaseDecoratorSymbol);
      assert(!!definitionB);
      assert(definitionB.length === 1);
      assert(definitionB[0].owner === _Family);
      assert(definitionB[0].decoratorSymbol === stringTitleCaseDecoratorSymbol);
      assert(definitionB[0].data === true);
    });

    it('Dynamic decorators can only be used multiple times on the same target when explicitly permitted', () => {
      // Test if forbidden multiple usages of not permitted decorator on same class
      expect(() => {
        @StringTitleCase()
        @StringTitleCase()
        class Test {}
      }).toThrow();
      // Test if allowed multiple usages of permitted decorator on same class
      expect(() => {
        @SimonSays('A')
        @SimonSays('B')
        class Test {}
      }).not.toThrow();
    });

    it('Dynamic decorators correctly hooking into constructor', () => {
      // EnTTify parent class
      const Family = enttify(_Family);

      // Clear registered instances repository
      registeredInstances.splice(0, registeredInstances.length);

      // Check created instances are registered
      const instanceA = new Family();
      assert(registeredInstances.length === 1);
      assert(registeredInstances[0] === instanceA);
      const instanceB = new Family();
      assert(registeredInstances.length === 2);
      assert(registeredInstances[1] === instanceB);
      const instanceC = new Family();
      assert(registeredInstances.length === 3);
      assert(registeredInstances[2] === instanceC);
    });

    it('Dynamic decorators correctly hooking into property setters/getters', () => {
      // EnTTify parent class
      const Family = enttify(_Family);

      // Initialize EnTTified class instance
      const family = new Family();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(family);

      // Verify dynamic decorator intercepts property getters/setters during instance construction
      assert(family.father === 'Homer J Simpson');
      assert(family.mother === 'Marge Simpson');
      assert(family.child === 'Bart El Barto Simpson');
      assert(underlying!.father === 'homer j simpson');
      assert(underlying!.mother === 'marge simpson');
      assert(underlying!.child === 'bart el barto simpson');

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      family.father = 'Abraham Jebediah Simpson';
      family.mother = 'Mona Penelope Simpson';
      family.child = 'Homer J Simpson';
      assert(family.father === 'Abraham Jebediah Simpson');
      assert(family.mother === 'Mona Penelope Simpson');
      assert(family.child === 'Homer J Simpson');
      assert(underlying!.father === 'abraham jebediah simpson');
      assert(underlying!.mother === 'mona penelope simpson');
      assert(underlying!.child === 'homer j simpson');
    });

    it('Dynamic decorators correctly hooking into staged property setters/getters', () => {
      // Example class
      @TapClassConstructorAndProperties<typeof _Example>({
        construct: instance => events.push({ event: 'constructed', target: instance }),
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
      class _Example {
        @def public value: string = 'testing';
      }
      // EnTTify parent class
      const Example = enttify(_Example);

      // Holds intercepted events from any instance of the Example class
      const events: Array<{ event: string; target: EnttClassInstance<ClassInstance>; data?: any }> = [];

      // Initialize EnTTified class instance
      const example = new Example();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(example);

      // Verify constructor and initialization events were intercepted
      assert(events.length === 4);
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
      assert(events[3].event === 'constructed'); // Constructed event
      assert(events[3].target === example);

      // Get value
      example.value;
      assert(events.length === 7);
      assert(events[4].event === 'get:before'); // Before getting initial value of the `.value` property
      assert(events[4].target === underlying);
      assert(events[4].data.key === 'value');
      assert(events[4].data.value === 'testing');
      assert(events[5].event === 'get:transform'); // Transformation while getting initial value of the `.value` property
      assert(events[5].target === underlying);
      assert(events[5].data.key === 'value');
      assert(events[5].data.value === 'testing');
      assert(events[6].event === 'get:after'); // After getting initial value of the `.value` property
      assert(events[6].target === underlying);
      assert(events[6].data.key === 'value');
      assert(events[6].data.value === 'testing');

      // Set value
      example.value = 'still testing';
      assert(events.length === 10);
      assert(events[7].event === 'set:before'); // Before setting initial value of the `.value` property
      assert(events[7].target === underlying);
      assert(events[7].data.key === 'value');
      assert(events[7].data.value === 'still testing');
      assert(events[8].event === 'set:transform'); // Transformation while setting initial value of the `.value` property
      assert(events[8].target === underlying);
      assert(events[8].data.key === 'value');
      assert(events[8].data.value === 'still testing');
      assert(events[9].event === 'set:after'); // After setting initial value of the `.value` property
      assert(events[9].target === underlying);
      assert(events[9].data.key === 'value');
      assert(events[9].data.value === 'still testing');
    });

    it('Dynamic decorators can be stacked and preserve definition order', () => {
      // EnTTify parent class
      const Quotes = enttify(_Quotes);

      // Initialize EnTTified class instance
      const quotes = new Quotes();
      // Fetch underlying object instance
      const underlying = getUnderlyingEnttifiedInstance(quotes);

      // Verify dynamic decorator intercepts property getters/setters during instance construction
      assert(quotes.quote === `Mr. Burns says: Moe says: Homer says: Apu says: Everything's coming up Milhouse.`);
      assert(quotes.quote === `Mr. Burns says: Moe says: Homer says: Apu says: Everything's coming up Milhouse.`);
      assert(underlying!.quote === `Everything's coming up Milhouse.`);

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      quotes.quote = `Mr. Burns says: Moe says: Homer says: Apu says: You tried your best and you failed miserably. The lesson is: Never try.`;
      assert(quotes.quote === `Mr. Burns says: Moe says: Homer says: Apu says: You tried your best and you failed miserably. The lesson is: Never try.`);
      assert(underlying!.quote === `You tried your best and you failed miserably. The lesson is: Never try.`);

      // Verify dynamic decorator intercepts property getters/setters after underlying instance property value assignment
      underlying!.quote = `I can't promise I'll try, but I'll try to try.`;
      assert(quotes.quote === `Mr. Burns says: Moe says: Homer says: Apu says: I can't promise I'll try, but I'll try to try.`);
      assert(underlying!.quote === `I can't promise I'll try, but I'll try to try.`);
    });

    it('Dynamic decorators correctly hooking into custom property querying', () => {
      // Example class
      @TapClassPropertyQuerying<typeof _Example>({
        has: (instance, key) => key in instance && !key.toString().startsWith('suppressed'),
        ownKeys: instance => Reflect.ownKeys(instance).filter(k => k.toString().startsWith('own')),
      })
      class _Example {
        @def public ownPropertyA: string = 'A';
        @def public ownPropertyB: string = 'B';
        @def public ownPropertyC: string = 'C';
        @def public suppressedPropertyA: string = 'A!';
        @def public suppressedPropertyB: string = 'B!';
        @def public suppressedPropertyC: string = 'C!';
      }
      // EnTTify parent class
      const Example = enttify(_Example);

      // Initialize EnTTified class instance
      const example = new Example();

      // Verify listed properties
      assert('ownPropertyA' in example);
      assert('ownPropertyB' in example);
      assert('ownPropertyC' in example);
      refute('suppressedPropertyA' in example);
      refute('suppressedPropertyB' in example);
      refute('suppressedPropertyC' in example);

      // Verify owned properties
      assert(Object.keys(example).length === 3);
      assert(Object.keys(example).includes('ownPropertyA'));
      assert(Object.keys(example).includes('ownPropertyB'));
      assert(Object.keys(example).includes('ownPropertyC'));
      refute(Object.keys(example).includes('suppressedPropertyA'));
      refute(Object.keys(example).includes('suppressedPropertyB'));
      refute(Object.keys(example).includes('suppressedPropertyC'));
    });
  });
}

// #endregion
