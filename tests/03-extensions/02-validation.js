// =====================================================================================================================
// Tests Entity Extension: Validation Extension
// =====================================================================================================================
let _                           = require('lodash'),
    assert                      = require('assert'),
    EnTT                        = require('../../dist').default,
    ValidationExtension         = require('../../dist').ValidationExtension;

// Entity extending and instantiation
module.exports = () => {
  describe('> Validation Extension', () => {

    // Should initialize entity instance with ".validation" property
    it('Should initialize entity instance with ".validation" property', () => {

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ ValidationExtension ];
        }
        static get props () {
          return {
            foo: { validate: () => { return;  } }
          };
        }
      }

      // Instantiate EnTT including the Validation extension
      const e = new MyExtendedEntity();

      // Check if instance has a ".validation" property initialized
      assert.ok(e.validation);
      assert.ok(_.isObject(e.validation));

    });

    // Should validate initial property values
    it('Should validate initial property values', () => {

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ ValidationExtension ];
        }
        static get props () {
          return {
            foo: {
              value: 'one hundred',
              validate: (value) => {
                // Check if property is a number
                if (typeof value !== 'number') {
                  return `Value "${value}" is not a number!`;
                }
              }
            }
          };
        }
      }

      // Instantiate EnTT including the Validation extension
      const e = new MyExtendedEntity();

      // Check if validation message for foo
      assert.ok(e.validation.foo);
      assert.equal(e.validation.foo.property, 'foo');
      assert.equal(e.validation.foo.value, 'one hundred');
      assert.equal(e.validation.foo.message, 'Value "one hundred" is not a number!');

    });

    // Should validate set property values
    it('Should validate set property values', () => {

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ ValidationExtension ];
        }
        static get props () {
          return {
            foo: {
              value: 'foo'
            },
            bar: {
              value: 'bar',
              validate: (value, entity) => {
                // Check 2 properties match
                if (value.indexOf(entity.foo) === -1) {
                  return `Value "${value}" doesn't contain "${entity.foo}"!`;
                }
              }
            }
          };
        }
      }

      // Instantiate EnTT including the Validation extension
      const e = new MyExtendedEntity();

      // Check if initial validation failed for bar
      assert.ok(e.validation.bar);
      assert.equal(e.validation.bar.property, 'bar');
      assert.equal(e.validation.bar.value, 'bar');

      // Update .bar to contain .foo
      e.bar = 'foo, bar, baz ...';
      // Check validation passing
      assert.equal(e.validation.bar, null);

      // Update .bar to no longer contain .foo
      e.bar = 'bar, baz, qux!';
      // Check validation failing
      assert.ok(e.validation.bar);
      assert.equal(e.validation.bar.property, 'bar');
      assert.equal(e.validation.bar.value, 'bar, baz, qux!');

      // Check validation reevaluated on any property changed - update .foo to match part of .bar
      e.foo = 'baz';
      // Check validation passing
      assert.equal(e.validation.bar, null);

    });

    // Should validate explicitly updated values
    it('Should validate explicitly updated values', () => {

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ ValidationExtension ];
        }
        static get props () {
          return {
            foo: {
              value: [ 1, 2, 3 ],
              validate: (value) => {
                if (!_.isArray(value) || value.length > 3) {
                  return `Array needs to be of length less or equal to 3!`;
                }
              }
            }
          };
        }
      }

      // Instantiate EnTT including the Validation extension
      const e = new MyExtendedEntity();

      // Check initial validation passing
      assert.equal(e.validation.foo, null);

      // Manually update .foo to fail validation
      e.foo.push(4);
      e.update();
      // Check validation failing
      assert.ok(e.validation.foo);

      // Manually update .foo to pass validation
      e.update(() => {
        e.foo.splice(0, 3);
      });
      // Check validation failing
      assert.equal(e.validation.foo, null);

    });

    // Should reject invalid values if so configured
    it('Should reject invalid values if so configured', () => {

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ new ValidationExtension({ reject: true }) ];
        }
        static get props () {
          return {
            foo: {
              value: 'one hundred',
              validate: (value) => {
                // Check if property is a number
                if (typeof value !== 'number') {
                  return `Value "${value}" is not a number!`;
                }
              }
            }
          };
        }
      }

      // Instantiate EnTT including the Validation extension
      const e = new MyExtendedEntity();

      // Check initial value wasn't accepted
      assert.equal(e.foo, null);

      // Update .foo value to pass validation
      e.foo = 123;
      // Check .foo value was validated and set
      assert.equal(e.foo, 123);
      assert.equal(e.validation.foo, null);

      // Update .foo value to fail validation
      e.foo = 'googleplex';
      // Check .foo value failed validation and was rejected
      assert.equal(e.foo, 123);
      assert.ok(e.validation.foo);

    });

  });
};
