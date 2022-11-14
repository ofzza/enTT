// Dynamic class decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { Info, Warning, createPropertyCustomDecorator, enttify, getUnderlyingEnttifiedInstance, verifyDecoratorUsage } from '../';

// Export tests
export function testsDynamicClassDecorators() {
  describe('EnTTification', () => {
    // Check if dynamic decorators throwing warnings when parent class not EnTTified
    it('Dynamic decorators are registered as such and will report if parent class is not EnTTified', () => {
      assert(false);
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
