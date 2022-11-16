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

// Holds warnings thrown by `verifyDecoratorUsage()` calls, out in public for test inspection purposes
const warnings: (Info | Warning | Error)[] = [];

// Unique identifier symbol identifying the StringTitleCase decorator
const stringTitleCaseDecoratorSymbol = Symbol('String title case class decorator');
/**
 * Makes sure all string properties are stored as lower case string and are presented as title cased
 * @returns Class decorator
 */
function StringTitleCase() {
  return createClassCustomDecorator(
    {
      setDecoratorDefinitionData: () => true,
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

// Export tests
export function testsDynamicClassDecorators() {
  @StringTitleCase()
  class _Family {
    public father!: string;
    public mother!: string;
    public child!: string;
  }

  describe('EnTTification', () => {
    // Check if dynamic decorators throwing warnings when parent class not EnTTified
    it('Dynamic decorators are registered as such and will report if parent class is not EnTTified', () => {
      let familyWarnings: (Error | Warning | Info)[] = [];

      // Check dynamic decorators throwing warnings when parent class not EnTTified
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      familyWarnings = warnings.filter(w => w.message.includes('_Family'));
      assert(familyWarnings.length === 2);
      assert(familyWarnings[0] !== familyWarnings[1]);

      // EnTTify parent class
      const Family = enttify(_Family);

      // Check dynamic decorators no longer throwing warnings
      warnings.splice(0, warnings.length);
      verifyDecoratorUsage((msg: any) => warnings.push(msg));
      familyWarnings = warnings.filter(w => w.message.includes('_Family'));
      assert(familyWarnings.length === 0);
    });

    // Check if decorator definitions are set correctly
    it('Definitions are set correctly', () => {
      // Check if decorator definitions set properly for @StringTitleCase()
      const definition = getDecoratedClassDecoratorDefinition(_Family, stringTitleCaseDecoratorSymbol);
      assert(!!definition);
      assert(definition.owner === _Family);
      assert(definition.decoratorSymbol === stringTitleCaseDecoratorSymbol);
      assert(definition.data === true);
    });

    // Check underlying instance of EnTTified object accessible and dynamic decorators correctly hooking into property setters/getters
    it('Dynamic decorators correctly hooking into property setters/getters', () => {
      assert(false);
    });

    // Check dynamic decorators can be stacked and will intercept getters/setters in order they were added to the property in
    it('Dynamic decorators can be stacked and preserve definition order', () => {
      assert(false);
    });
  });
}
