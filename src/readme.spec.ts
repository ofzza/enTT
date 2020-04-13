// README.md file examples' tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from './tests.init'
import { EnTT, Property, Serializable, Validate, EnttValidationError } from './';

// Import validation providers
import * as Joi from '@hapi/joi';
import * as Yup from 'yup';

// Test ...
describe('README examples', () => {

  describe('Using @Property decorator', () => {

    describe('Enumerable', () => {

      it('Example', () => {

        class MyEntityClass extends EnTT {
          constructor () { super(); super.entt(); }
        
          @Property({ enumerable: true })
          public standard = 'default';
        
          @Property({ enumerable: true })
          public enumerable = 'enumerable';
        
          @Property({ enumerable: false })
          public nonenumerable = 'nonenumerable';
        }
        
        const instance = new MyEntityClass();
        assert(Object.keys(instance).join('|') === ['standard', 'enumerable'].join('|'));

      });

    });

    describe('Read-only / Write-only', () => {

      it('Example', () => {

        class MyEntityClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          @Property({ set: false })
          public readonly = 'readonly';
      
          @Property({ get: false })
          public writeonly = 'writeonly';
        }
        
        const instance = new MyEntityClass();
        expect(() => { instance.readonly = 'value' }).toThrow();
        assert(instance.readonly === 'readonly');
        assert((instance.writeonly = 'writeonly' ) === 'writeonly');
        assert(instance.writeonly === undefined);
      });

    })

    describe('Custom getter and/or setter', () => {

      it('Example', () => {

        function toTitleCase (value) {
          return (value && value[0] ? value[0].toUpperCase() + value.substr(1) : value);
        }

        class MyEntityClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          @Property({ set: (obj, value) => toTitleCase(value) })
          public firstName = undefined as string;
      
          @Property({ set: (obj, value) => toTitleCase(value) })
          public lastName = undefined as string;
      
          @Property({ get: (obj, value) => `${obj.firstName} ${obj.lastName}` })
          public fullName = undefined as string;
        }
        
        const instance = new MyEntityClass();
        instance.firstName = 'john';
        assert(instance.firstName === 'John');
        instance.lastName = 'doe';
        assert(instance.lastName === 'Doe');
        assert(instance.fullName === 'John Doe');
      });

    });

  });

  describe('Using @Serializable decorator', () => {

    describe('Simply serialize, deserialize and cast', () => {

      it('Example', () => {

        class MyPersonClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          public firstName = undefined as string;
          public lastName = undefined as string;
        }
      
        const instance = new MyPersonClass();
        instance.firstName = 'John';
        instance.lastName = 'Doe';
      
        const serialized = instance.serialize();
        assert(JSON.stringify(serialized) === JSON.stringify({ firstName: "John", lastName: "Doe" }));
      
        const deserialized = new MyPersonClass();
        deserialized.deserialize(serialized);
        assert(deserialized.firstName === 'John');
        assert(deserialized.lastName === 'Doe');
      
        const castSingle = MyPersonClass.cast(serialized);
        assert(castSingle instanceof MyPersonClass);
        assert(castSingle.firstName === 'John');
        assert(castSingle.lastName === 'Doe');                
        const castArray = MyPersonClass.cast([ serialized, serialized, serialized ], { into: [MyPersonClass] });
        assert(castArray[0] instanceof MyPersonClass);
        assert(castArray[0].firstName === 'John');
        assert(castArray[0].lastName === 'Doe');                
        const castHashmap = MyPersonClass.cast({ a: serialized, b: serialized, c: serialized }, { into: {MyPersonClass} });
        assert(castHashmap.a instanceof MyPersonClass);
        assert(castHashmap.a.firstName === 'John');
        assert(castHashmap.a.lastName === 'Doe');
        MyPersonClass.cast(Promise.resolve(serialized)).then((castPromise) => {
          assert(castPromise instanceof MyPersonClass);
          assert(castPromise.firstName === 'John');
          assert(castPromise.lastName === 'Doe');                
        })
      });

    });

    describe('Aliasing property names', () => {

      it('Example', () => {
              
        class MyPersonClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          @Serializable({ alias: 'first_name' })
          public firstName = undefined as string;
          
          @Serializable({ alias: 'last_name' })
          public lastName = undefined as string;
        }
      
        const instance = new MyPersonClass();
        instance.firstName = 'John';
        instance.lastName = 'Doe';
      
        const serialized = instance.serialize();
        assert(JSON.stringify(serialized) === JSON.stringify({ first_name: "John", last_name: "Doe" }));
      
        const deserialized = new MyPersonClass();
        deserialized.deserialize(serialized);
        assert(deserialized.firstName === 'John');
        assert(deserialized.lastName === 'Doe');
      
        const cast = MyPersonClass.cast(serialized);
        assert(cast.firstName === 'John');
        assert(cast.lastName === 'Doe');   

      });

    });

    describe('Not-Serializable properties', () => {

      it('Example', () => {
              
        class MyAuthenticationClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          @Serializable({ serialize: true })
          public password = undefined as string;
          
          @Serializable({ serialize: false })
          public repeatPassword = undefined as string;
        }
      
        const instance = new MyAuthenticationClass();
        instance.password = '123';
        instance.repeatPassword = '123';
      
        const serialized = instance.serialize();
        assert(JSON.stringify(serialized) === JSON.stringify({ password: "123" }));
      
        const deserialized = new MyAuthenticationClass();
        deserialized.deserialize({ ...serialized, repeatPassword: '123' });
        assert(deserialized.password === '123');
        assert(deserialized.repeatPassword === undefined);
      
        const cast = MyAuthenticationClass.cast(serialized);
        assert(deserialized.password === '123');
        assert(deserialized.repeatPassword === undefined);

      });

    });

    describe('Preserving nested class instances', () => {

      it('Example', () => {
              
        class MyPersonClass extends EnTT {
          constructor (name?: string) {
            super(); super.entt();
            this.name = name;
          }
      
          public name = undefined as string;
      
          @Serializable({ cast: MyPersonClass })
          public spouse   = undefined as MyPersonClass;

          @Serializable({ cast: [MyPersonClass] })
          public siblings = [] as MyPersonClass[];

          @Serializable({ cast: {MyPersonClass} })
          public parents  = {
                              mother: undefined as MyPersonClass,
                              father: undefined as MyPersonClass
                            } as Record<string, MyPersonClass>;
        }
      
        const person = new MyPersonClass('John Doe');
        person.spouse = new MyPersonClass('Joanna Doe');
        person.siblings.push(
          new MyPersonClass('Jo Doe'),
          new MyPersonClass('Johnny Doe'),
          new MyPersonClass('Jay Doe')
        );
        person.parents.mother = new MyPersonClass('Joanna Doe Sr.');
        person.parents.father = new MyPersonClass('John Doe Sr.');
      
        const serialized = person.serialize();
        assert(JSON.stringify(serialized) === JSON.stringify(
          {
            name: "John Doe",
            spouse: {
              name: "Joanna Doe",
              siblings: [],
              parents: {}
            },
            siblings: [
              {
                name: "Jo Doe",
                siblings: [],
                parents: {}
              },
              {
                name: "Johnny Doe",
                siblings: [],
                parents: {}
              },
              {
                name: "Jay Doe",
                siblings: [],
                parents: {}
              }
            ],
            parents: {
              mother: {
                name: "Joanna Doe Sr.",
                siblings: [],
                parents: {}
              },
              father: {
                name: "John Doe Sr.",
                siblings: [],
                parents: {}
              }
            }
          }
        ));

        const deserialized = new MyPersonClass();
        deserialized.deserialize(serialized);
        assert(deserialized instanceof MyPersonClass);
        assert(deserialized.spouse instanceof MyPersonClass);
        assert(deserialized.siblings[0] instanceof MyPersonClass);
        assert(deserialized.siblings[1] instanceof MyPersonClass);
        assert(deserialized.siblings[2] instanceof MyPersonClass);
        assert(deserialized.parents.mother instanceof MyPersonClass);
        assert(deserialized.parents.father instanceof MyPersonClass);
      
        const cast = MyPersonClass.cast(serialized);
        assert(cast instanceof MyPersonClass);
        assert(cast.spouse instanceof MyPersonClass);
        assert(cast.siblings[0] instanceof MyPersonClass);
        assert(cast.siblings[1] instanceof MyPersonClass);
        assert(cast.siblings[2] instanceof MyPersonClass);
        assert(cast.parents.mother instanceof MyPersonClass);
        assert(cast.parents.father instanceof MyPersonClass);
     });

    });

  });

  describe('Using @Validate decorator', () => {

    describe('Validate by data type', () => {

      it('Example', () => {
      
        class MyValidClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          @Validate({ type: 'boolean' })
          aBoolean = false as boolean;
      
          @Validate({ type: 'number' })
          aNumber = 123 as number;
      
          @Validate({ type: 'string' })
          aString = 'abc' as string;
      
          @Validate({ type: 'object' })
          anObject = { } as object
        }
      
        const instance = new MyValidClass();
        assert(instance.valid === true);
        assert(Object.keys(instance.errors).length === 0);

        instance.aBoolean = undefined;
        instance.aNumber  = undefined;
        instance.aString  = undefined;
        instance.anObject = undefined;
      
        assert(instance.valid === false);
        assert(Object.keys(instance.errors).length === 4);
        assert(instance.errors['aBoolean'].length  === 1);
        assert(instance.errors['aNumber'].length   === 1);
        assert(instance.errors['aString'].length   === 1);
        assert(instance.errors['anObject'].length  === 1);

      });
          
    });

    describe('Validate using a custom validator', () => {

      describe('Custom validator function', () => {

        it('Example', () => {

          class MyDatesClass extends EnTT {
            constructor () { super(); super.entt(); }
        
            // Validate year is within a predefined scope
            @Validate({ provider: (obj, value) => (value > 1900) && (value < 2100) })
            born = undefined as number;
        
            // Validate year is within dynamic scope and throw custom validation errors
            @Validate({
              provider: (obj, value) => {
                const errs = [];
                if (value < obj.born) {
                  errs.push(new EnttValidationError({
                    type:    'custom',
                    message: 'Graduation year must be greater than birth date!',
                    context: {}
                  }));
                }
                if (value >= obj.born) {
                  errs.push(new EnttValidationError({
                    type:    'custom',
                    message: 'Graduation year must be smaller than 2100!',
                    context: {}
                  }));
                }
                return errs;
              }
            })
            graduated = undefined as number;
        
          }
        
          const instance = new MyDatesClass();
          assert(instance.valid === false);
          assert(Object.keys(instance.errors).length === 1);
          assert(instance.errors['born'].length === 1);
          
          instance.born = 1800;
          assert(instance.valid === false);
          assert(instance.errors['born'].length === 1);
        
          instance.born = 1950;
          instance.graduated = 1949;
          assert(instance.valid === false);
          assert(instance.errors['graduated'].length === 1);
          assert(instance.errors['graduated'][0].type === 'custom');
        });

      });

      describe('JOI validator', () => {

        it('Example', () => {

          class MyDatesClass extends EnTT {
            constructor () { super(); super.entt(); }
        
            // Validate year is within a predefined scope
            @Validate({ provider: Joi.number().strict().integer().min(1900).max(2100).required() })
            born = undefined as number;
        
            // Validate year is within dynamic scope and throw custom validation errors
            @Validate({ provider: Joi.number().strict().integer().min(Joi.ref('$.born')).max(2100).required() })
            graduated = undefined as number;
        
          }
        
          const instance = new MyDatesClass();
          assert(instance.valid === false);
          assert(Object.keys(instance.errors).length === 2);
          assert(instance.errors['born'].length === 1);
          assert(instance.errors['graduated'].length === 1);
          
          instance.born = 1800;
          assert(instance.valid === false);
          assert(Object.keys(instance.errors).length === 2);
          assert(instance.errors['born'].length === 1);
          assert(instance.errors['graduated'].length === 1);
        
          instance.born = 1950;
          instance.graduated = 1949;
          assert(instance.valid === false);
          assert(Object.keys(instance.errors).length === 1);
          assert(instance.errors['graduated'].length === 1);
        });

      });

      describe('YUP validator', () => {

        it('Example', () => {

          class MyDatesClass extends EnTT {
            constructor () { super(); super.entt(); }
        
            // Validate year is within a predefined scope
            @Validate({ provider: Yup.number().strict().integer().min(1900).max(2100).required() })
            born = undefined as number;
        
            // Validate year is within dynamic scope and throw custom validation errors
            @Validate({ provider: Yup.number().strict().integer().min(Yup.ref('$.born')).max(2100).required() })
            graduated = undefined as number;
        
          }
        
          const instance = new MyDatesClass();
          assert(instance.valid === false);
          assert(Object.keys(instance.errors).length === 2);
          assert(instance.errors['born'].length === 1);
          assert(instance.errors['graduated'].length === 1);
          
          instance.born = 1800;
          assert(instance.valid === false);
          assert(Object.keys(instance.errors).length === 2);
          assert(instance.errors['born'].length === 1);
          assert(instance.errors['graduated'].length === 1);
        
          instance.born = 1950;
          instance.graduated = 1949;
          assert(instance.valid === false);
          assert(Object.keys(instance.errors).length === 1);
          assert(instance.errors['graduated'].length === 1);
        });

      });

    });

    describe('Validating nested class instances', () => {

      it('Example', () => {

        class MyNestedClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          @Validate({ provider: Yup.number().strict().required() })
          aNumber = undefined as number;
        }
      
        class MyParentClass extends EnTT {
          constructor () { super(); super.entt(); }
      
          @Validate({ provider: Yup.boolean().strict().required() })
          aBoolean = undefined as boolean;
      
          nested = new MyNestedClass();
        }
      
        const instance = new MyParentClass();
        (instance as any).aBoolean = 'abc';
        ((instance as any).nested as any).aNumber = 'abc';
        assert(instance.valid === false);
        assert(Object.keys(instance.errors).length === 2);

      });

    });

  });

});
