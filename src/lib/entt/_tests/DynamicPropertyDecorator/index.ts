// Dynamic property decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { createCustomDecorator, enttify, getUnderlyingEnttifiedInstance, verifyDecoratorUsage } from '../../';

// Unique identifier symbol identifying the NumericDateValue decorator
const numericDateValueDecoratorSymbol = Symbol('Numeric date value property decorator');
/**
 * Makes sure a numberic property is represented as a date
 * @returns Property decoration
 */
function NumericDateValue() {
  return createCustomDecorator(
    {
      onPropertyGet: (value: number): Date => new Date(value),
      onPropertySet: ({ target, key, value }) => ({
        target,
        key,
        value: value.getTime(),
      }),
      whenUsedOnNotEnttified: (target, key) => {
        console.warn(`@NumericDateValue decorator, applied to ${target.constructor.name}.${key.toString()}), requires the class to be EnTTified before usage!`);
      },
    },
    numericDateValueDecoratorSymbol,
  );
}

// Unique identifier symbol identifying the NumericDateValue decorator
const stringDateValueDecoratorSymbol = Symbol('Numeric date value property decorator');
/**
 * Makes sure a numberic property is represented as a date
 * @returns Property decoration
 */
function StringDateValue() {
  return createCustomDecorator(
    {
      onPropertyGet: (value: string): Date => new Date(value),
      onPropertySet: ({ target, key, value }) => ({
        target,
        key,
        value: value.toISOString(),
      }),
      whenUsedOnNotEnttified: (target, key) => {
        console.warn(`@StringDateValue decorator, applied to ${target.constructor.name}.${key.toString()}), requires the class to be EnTTified before usage!`);
      },
    },
    stringDateValueDecoratorSymbol,
  );
}

// Export tests
export function testsDynamicPropertyDecorators() {
  // Define a class for testing property dynamic decorator
  class _Notification {
    // Random property
    public text = 'I am a notification';
    // Property that is internally a string, but externally a Date
    @StringDateValue()
    public created: Date = new Date();
    // Property that is internally a number, but externally a Date
    @NumericDateValue()
    public modified: Date = new Date();
  }
  // Define a class for testing property dynamic decorator
  class _EnttifiedNotification {
    // Random property
    public text = 'I am a notification';
    // Property that is internally a string, but externally a Date
    @StringDateValue()
    public created: Date = new Date();
    // Property that is internally a number, but externally a Date
    @NumericDateValue()
    public modified: Date = new Date();
  }
  const Notification = enttify(_EnttifiedNotification);

  it('Works?!', () => {
    const notification = new Notification();
    assert(notification.created instanceof Date);
    assert(notification.modified instanceof Date);

    notification.created = new Date();
    notification.modified = new Date();
    assert(notification.created instanceof Date);
    assert(notification.modified instanceof Date);

    const underlying = getUnderlyingEnttifiedInstance(notification);
    assert(typeof underlying.created === 'string');
    assert(typeof underlying.modified === 'number');

    verifyDecoratorUsage();
  });
}
