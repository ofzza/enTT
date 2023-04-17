// Dynamic class decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import {
  Info,
  Warning,
  createClassCustomDecorator,
  getDecoratedClassDecoratorDefinition,
  FullPathPropertyValue,
  enttify,
  getUnderlyingEnttifiedInstance,
  verifyDecoratorUsage,
} from '../';
import { def } from '../../../decorators';

// Set minimal expected number of instantiations performed per second
const INSTANTIATIONS_PER_SECOND = 10000;
// Set how many times slowed instantiation of an EnTTified class is allowed to be compared to plain class
const ENTTITIFICATION_SLOWDOWN_FACTOR = 1000;

// Holds warnings thrown by `verifyDecoratorUsage()` calls, out in public for test inspection purposes
const warnings: Array<Info | Warning | Error> = [];

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

// Export tests
export function testDynamicClassDecorators() {
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
    // Check if dynamic decorators throwing warnings when parent class not EnTTified
    it('Dynamic decorators are registered as such and will report if parent class is not EnTTified', () => {
      let familyWarnings: Array<Error | Warning | Info> = [];

      // Check dynamic decorators throwing warnings when parent class not EnTTified
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      familyWarnings = warnings.filter(w => w.message.includes('_Family'));
      assert(familyWarnings.length === 1);

      // EnTTify parent class
      const _ = enttify(_Family);

      // Check dynamic decorators no longer throwing warnings
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      familyWarnings = warnings.filter(w => w.message.includes('_Family'));
      assert(familyWarnings.length === 0);
    });

    // Check if using EnTTified classes is performant
    it('Enttitified class with dynamic decorators is performant', () => {
      // Perform as many instantiations as possible in 100ms
      let countPlain = 0;
      const startEnttified = Date.now();
      while (!(countPlain % 1000 === 0 && Date.now() - startEnttified >= 100)) {
        const family = new _Family();
        countPlain++;
      }
      const plainInstantiationsPerSecond = (1000 * countPlain) / (Date.now() - startEnttified);

      // EnTTify parent class
      const Family = enttify(_Family);

      // Perform as many instantiations as possible in 100ms
      let countEnttified = 0;
      const startPlain = Date.now();
      while (!(countEnttified % 1000 === 0 && Date.now() - startPlain >= 100)) {
        const family = new Family();
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
      // Check if decorator definitions set properly for @StringTitleCase()
      const definition = getDecoratedClassDecoratorDefinition(_Family, stringTitleCaseDecoratorSymbol);
      assert(!!definition);
      assert(definition.length === 1);
      assert(definition[0].owner === _Family);
      assert(definition[0].decoratorSymbol === stringTitleCaseDecoratorSymbol);
      assert(definition[0].data === true);
    });
    // Check if decorator definitions are set correctly
    it('Definitions are set correctly and can be reached via enttified class', () => {
      // EnTTify parent class
      const Family = enttify(_Family);

      // Check if decorator definitions set properly for @StringTitleCase()
      const definition = getDecoratedClassDecoratorDefinition(Family, stringTitleCaseDecoratorSymbol);
      assert(!!definition);
      assert(definition.length === 1);
      assert(definition[0].owner === _Family);
      assert(definition[0].decoratorSymbol === stringTitleCaseDecoratorSymbol);
      assert(definition[0].data === true);
    });
    // Check if decorator definitions are set correctly
    it('Definitions are set correctly and can be reached via enttified class instance', () => {
      // EnTTify parent class
      const Family = enttify(_Family);
      const family = new Family();

      // Check if decorator definitions set properly for @StringTitleCase()
      const definition = getDecoratedClassDecoratorDefinition(family, stringTitleCaseDecoratorSymbol);
      assert(!!definition);
      assert(definition.length === 1);
      assert(definition[0].owner === _Family);
      assert(definition[0].decoratorSymbol === stringTitleCaseDecoratorSymbol);
      assert(definition[0].data === true);
    });

    // Check if decorator definitions can be used multiple times only if explicitly permitted
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

    // Check underlying instance of EnTTified object accessible and dynamic decorators correctly hooking into property setters/getters
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
      assert(underlying.father === 'homer j simpson');
      assert(underlying.mother === 'marge simpson');
      assert(underlying.child === 'bart el barto simpson');

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      family.father = 'Abraham Jebediah Simpson';
      family.mother = 'Mona Penelope Simpson';
      family.child = 'Homer J Simpson';
      assert(family.father === 'Abraham Jebediah Simpson');
      assert(family.mother === 'Mona Penelope Simpson');
      assert(family.child === 'Homer J Simpson');
      assert(underlying.father === 'abraham jebediah simpson');
      assert(underlying.mother === 'mona penelope simpson');
      assert(underlying.child === 'homer j simpson');
    });

    // Check dynamic decorators can be stacked and will intercept getters/setters in order they were added to the property in
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
      assert(underlying.quote === `Everything's coming up Milhouse.`);

      // Verify dynamic decorator intercepts property getters/setters during property value assignment
      quotes.quote = `Mr. Burns says: Moe says: Homer says: Apu says: You tried your best and you failed miserably. The lesson is: Never try.`;
      assert(quotes.quote === `Mr. Burns says: Moe says: Homer says: Apu says: You tried your best and you failed miserably. The lesson is: Never try.`);
      assert(underlying.quote === `You tried your best and you failed miserably. The lesson is: Never try.`);

      // Verify dynamic decorator intercepts property getters/setters after underlying instance property value assignment
      underlying.quote = `I can't promise I'll try, but I'll try to try.`;
      assert(quotes.quote === `Mr. Burns says: Moe says: Homer says: Apu says: I can't promise I'll try, but I'll try to try.`);
      assert(underlying.quote === `I can't promise I'll try, but I'll try to try.`);
    });
  });
}
