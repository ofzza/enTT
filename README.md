# enTT

`enTT`, read as "Entity", is an extensible TypeScript data-modeling solution with some of the typically required functionality, such as change-detection, easy import/export, composition/decomposition, data validation, etc., all available out of the box and easy to use.

###### Table of contents:

- [Get enTT](#get-entt)
- [Using enTT](#using-entt)
  - [@Property decorator](#property-decorator)
  - [@Serializable decorator](#serializable-decorator)
  - [@Validate decorator](#validate-decorator)
- [Contributing](#contributing)
  - [Reporting Issues](#reporting-issues)
  - [Contributing Code](#contributing-code)

# Get enTT

To start using `enTT` in your project, simply install it from NPM by running the following in your terminal:

```sh
> npm install @ofzza/entt --save
```

Alternatively, get an extended implementation:

- RxJS extension: [enTT-RxJS](https://github.com/ofzza/enTT-RxJS)

# Using enTT

To make any class an `enTT` class, just extend the EnTT base and run `super.entt()` in its constructor, right after `super()`:

```ts
import { EnTT } from '@ofzza/entt';

class MyEntityClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }
}
```

By doing this any properties defined in the class will now be managed and will be eligible for receiving additional functionality via a number of decorators.

> &nbsp;
>
> **Note**: All properties, as to be picked up by EnTT base class, need to be initialized, even if this means initializing them explicitly as `undefined`.
>
> <details> <summary>EXAMPLE</summary>
>
> ```ts
> public invalid1;          // Won't get picked up by EnTT and won't be eligible to accept functionality via decorators
>
> public invalid2: string;  // Won't get picked up by EnTT and won't be eligible to accept functionality via decorators
>
> public valid1?: string = undefined; // Valid EnTT property
>
> public valid2:string = 'abcd';      // Valid EnTT property
>
> public valid3 = 'abcd';             // Valid EnTT property
> ```
>
> </details>
> &nbsp;

## @Property decorator

The `@Property` decorator allows for customization of properties as read-only, write-only, enumerable or non-enumerable, or for assignment of a custom getter or setter.

### Enumerable

All properties are enumerable by default. To turn a property non-enumerable, just decorate it, like so:

```ts
@Property({ enumerable: false })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT, Property } from '@ofzza/entt';

class MyEntityClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Property({ enumerable: true })
  public standard = 'default';

  @Property({ enumerable: true })
  public enumerable = 'enumerable';

  @Property({ enumerable: false })
  public nonenumerable = 'nonenumerable';
}

const instance = new MyEntityClass();
console.log(Object.keys(instance)); // Outputs: "standard", "enumerable"
```

</details>

### Read-only / Write-only

Any property can be made read-only or write only by explicitly removing its setter or getter, like so:

```ts
@Property({ set: false })

@Property({ get: false })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT, Property } from '@ofzza/entt';

class MyEntityClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Property({ set: false })
  public readonly = 'readonly';

  @Property({ get: false })
  public writeonly = 'writeonly';
}

const instance = new MyEntityClass();
instance.readonly = 'value'; // Throws error
console.log(instance.readonly); // Outputs: "readonly"
instance.writeonly = 'value'; // Accepts value
console.log(instance.writeonly); // Outputs: undefined
```

</details>

### Custom getter and/or setter

Any property can be augmented with a custom setter and/or getter modifying the property value before reading and/or writing, like so:

```ts
@Property({ set: (value, obj) => any })

@Property({ get: (value, obj) => any })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT, Property } from '@ofzza/entt';

class MyPersonClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Property({ set: (value, obj) => toTitleCase(value) })
  public firstName?: string = undefined;

  @Property({ set: (value, obj) => toTitleCase(value) })
  public lastName?: string = undefined;

  @Property({ get: (value, obj) => `${obj.firstName} ${obj.lastName}` })
  public fullName?: string = undefined;
}

const instance = new MyPersonClass();
instance.firstName = 'john';
console.log(instance.firstName); // Outputs: "John"
instance.lastName = 'doe';
console.log(instance.lastName); // Outputs: "Doe"
console.log(instance.fullName); // Outputs: "John Doe"
```

</details>

### Property tagging

Properties can be tagged with a single or multiple string tags. Later, properties can be searched by tag. This can be useful when writing a service that needs to accept different EnTT models and somehow know which properties serve a certain purpose on each, like finding a PrimaryKey property, or a property best used to represent a name of the model instance. Property tagging is used like so:

```ts
@Property({ tag: 'PK' })
public id1?: string = undefined;

...

const keys1 = MyEntityClass.findTaggedProperties('PK');

...

@Property({ tag: ['PK', 'guid'] })
public id2?: string = undefined;

...

const keys2 = EnTT.findTaggedProperties('PK', { from: MyEntityClass });

```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT, Property } from '@ofzza/entt';

class MyPersonClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Property({ tag: 'callsign' })
  public name?: string = undefined;
}

class MyCarClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Property({ tag: 'callsign' })
  public make?: string = undefined;
}

function promptCallsign(instance: EnTT, from: new () => EnTT) {
  return instance[EnTT.findTaggedProperties('callsign', { from })[0]];
}

const person = new MyPersonClass();
person.name = 'Marty McFly';
const car = new MyCarClass();
car.make = 'Delorean';

console.log(promptCallsign(person, MyPersonClass)); // Outputs: Marty McFly
console.log(promptCallsign(car, MyCarClass)); // Outputs: Delorean
```

</details>

## @Serializable decorator

The `@Serializable` decorator provides a simple way of serializing and deserializing EnTT instances into and from raw data, such that even nested instances will be preserved.

All EnTT instances will expose serialization methods:

```ts
class MyEntityClass extends EnTT {

  public serialize (type = 'object' as 'object'|'json') => object|string

  public deserialize (value: object|string, type = 'object' as 'object'|'json', { validate = true }) => void

  public static cast (value: object|string, { into = undefined as ((new () => EnTT) | (new () => EnTT)[] | Record<any, (new () => EnTT)>), type = 'object' as ('object'|'json'), validate = true } = {}) => MyEntityClass

  public static clone (instance: MyEntityClass, { target: MyEntityClass, validate = true }) => MyEntityClass

}
```

### Simply serialize, deserialize, cast and clone

<details><summary>EXAMPLE</summary>

Without any customization, all properties can be serialized and deserialized:

```ts
import { EnTT } from '@ofzza/entt';

class MyPersonClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  public firstName?: string = undefined;
  public lastName?: string = undefined;
}

const instance = new MyPersonClass();
instance.firstName = 'John';
instance.lastName = 'Doe';

const serialized = instance.serialize();
console.log(serialized); // Outputs: { firstName: "John", lastName: "Doe" }

const deserialized = new MyPersonClass();
deserialized.deserialize(serialized);
console.log(deserialized.firstName); // Outputs: "John"
console.log(deserialized.lastName); // Outputs: "Doe"

const castSingle = MyPersonClass.cast(serialized);
console.log(castSingle instanceof MyPersonClass); // Outputs: true
console.log(castSingle.firstName); // Outputs: "John"
console.log(castSingle.lastName); // Outputs: "Doe"

const castArray = MyPersonClass.cast([serialized, serialized, serialized], {
  into: [MyPersonClass],
});
console.log(castArray[0] instanceof MyPersonClass); // Outputs: true
console.log(castArray[0].firstName); // Outputs: "John"
console.log(castArray[0].lastName); // Outputs: "Doe"

const castHashmap = MyPersonClass.cast({ a: serialized, b: serialized, c: serialized }, { into: { MyPersonClass } });
console.log(castHashmap.a instanceof MyPersonClass); // Outputs: true
console.log(castHashmap.a.firstName); // Outputs: "John"
console.log(castHashmap.a.lastName); // Outputs: "Doe"

const castPromise = await MyPersonClass.cast(Promise.resolve(serialized));
console.log(castPromise instanceof MyPersonClass); // Outputs: true
console.log(castPromise.firstName); // Outputs: "John"
console.log(castPromise.lastName); // Outputs: "Doe"

const cloned = MyPersonClass.clone(instance);
console.log(instance !== cloned); // Outputs: true
console.log(instance.serialize('json') === cloned.serialize('json')); // Outputs: true
```

</details>

### Aliasing property names

Any property can define an alias to be used when serializing and deserializing data, like so:

```ts
@Serializable({ alias: string })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT } from '@ofzza/entt';

class MyPersonClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Serializable({ alias: 'first_name' })
  public firstName?: string = undefined;

  @Serializable({ alias: 'last_name' })
  public lastName?: string = undefined;
}

const instance = new MyPersonClass();
instance.firstName = 'John';
instance.lastName = 'Doe';

const serialized = instance.serialize();
console.log(serialized); // Outputs: { first_name: "John", last_name: "Doe" }

const deserialized = new MyPersonClass();
deserialized.deserialize(serialized);
console.log(deserialized.firstName); // Outputs: "John"
console.log(deserialized.lastName); // Outputs: "Doe"

const cast = MyPersonClass.cast(serialized);
console.log(cast.firstName); // Outputs: "John"
console.log(cast.lastName); // Outputs: "Doe"
```

</details>

### Custom serialization

Any property can be defined not participating in serialization, like so:

```ts
@Serializable({ serialize: false })
```

... not participating in de-serialization, like so:

```ts
@Serializable({ deserialize: false })
```

... or both, like so:

```ts
@Serializable({ serialize: false, deserialize: false })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT } from '@ofzza/entt';

class MyAuthenticationClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Serializable()
  public password?: string = undefined;

  @Serializable({ serialize: false, deserialize: false })
  public repeatPassword?: string = undefined;
}

const instance = new MyAuthenticationClass();
instance.password = '123';
instance.repeatPassword = '123';

const serialized = instance.serialize();
console.log(serialized); // Outputs: { password: '123' }
```

</details>

Any property can also have defined custom serialization and/or de-serialization mapping functions, like so:

```ts
@Serializable({ deserialize: (value, obj) => any })

@Serializable({ serialize: (value, obj) => any, })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT } from '@ofzza/entt';

class MyTimestampedClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Serializable({
    deserialize: (value, obj) => new Date(value),
    serialize: (value, obj) => value.getTime(),
  })
  public timestamp?: Date = undefined;
}

const now = Date.now(),
instance = new MyTimestampedClass();
instance.timestamp = new Date(now);

const serialized = instance.serialize();
console.log(JSON.stringify(serialized) === JSON.stringify({ timestamp: now }); // Outputs: true

const deserialized = new MyTimestampedClass();
deserialized.deserialize({ ...serialized });
console.log(deserialized.timestamp.getTime() === instance.timestamp.getTime()); // Outputs: true

const cast = MyTimestampedClass.cast(serialized);
console.log(cast.timestamp.getTime() === instance.timestamp.getTime()); // Outputs: true
```

</details>

### Preserving nested class instances

Any property can hold nested instances of other EnTT classes, either directly or in an array or a hashmap. If this is the case, it is possible to configure the property as such so that when deserializing all the nested EnTT instances will be cast into their correct classes, like so:

```ts
@Serializable({ cast: MyEnTTClass })

@Serializable({ cast: [MyEnTTClass] })

@Serializable({ cast: {MyEnTTClass} })
```

... or using alternative syntax meant to help mitigate circular dependency problems:

```ts
@Serializable({ cast: () => MyCurcularDependencyEnTTClass })

@Serializable({ cast: () => [MyCurcularDependencyEnTTClass] })

@Serializable({ cast: () => ({MyCurcularDependencyEnTTClass}) })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT } from '@ofzza/entt';

class MyPersonClass extends EnTT {
  constructor(name?: string) {
    super();
    super.entt();
    this.name = name;
  }

  public name?: string = undefined;

  @Serializable({ cast: MyPersonClass })
  public spouse?: MyPersonClass = undefined;

  @Serializable({ cast: [MyPersonClass] })
  public siblings = [] as MyPersonClass[];

  @Serializable({ cast: { MyPersonClass } })
  public parents = {
    mother: undefined as MyPersonClass,
    father: undefined as MyPersonClass,
  } as Record<string, MyPersonClass>;
}

const person = new MyPersonClass('John Doe');
person.spouse = new MyPersonClass('Joanna Doe');
person.siblings.push(new MyPersonClass('Jo Doe'), new MyPersonClass('Johnny Doe'), new MyPersonClass('Jay Doe'));
person.parents.mother = new MyPersonClass('Joanna Doe Sr.');
person.parents.father = new MyPersonClass('John Doe Sr.');

const serialized = person.serialize();
// Equals:
// {
//   name: "John Doe",
//   spouse: {
//     name: "Joanna Doe",
//     siblings: [],
//     parents: {}
//   },
//   siblings: [
//     {
//       name: "Jo Doe",
//       siblings: [],
//       parents: {}
//     },
//     {
//       name: "Johnny Doe",
//       siblings: [],
//       parents: {}
//     },
//     {
//       name: "Jay Doe",
//       siblings: [],
//       parents: {}
//     }
//   ],
//   parents: {
//     mother: {
//       name: "Joanna Doe Sr.",
//       siblings: [],
//       parents: {}
//     },
//     father: {
//       name: "John Doe Sr.",
//       siblings: [],
//       parents: {}
//     }
//   }
// }

const deserialized = new MyPersonClass();
deserialized.deserialize(serialized);
console.log(deserialized instanceof MyPersonClass); // Outputs: true
console.log(deserialized.spouse instanceof MyPersonClass); // Outputs: true
console.log(deserialized.siblings[0] instanceof MyPersonClass); // Outputs: true
console.log(deserialized.siblings[1] instanceof MyPersonClass); // Outputs: true
console.log(deserialized.siblings[2] instanceof MyPersonClass); // Outputs: true
console.log(deserialized.parents.mother instanceof MyPersonClass); // Outputs: true
console.log(deserialized.parents.father instanceof MyPersonClass); // Outputs: true

const cast = MyPersonClass.cast(serialized);
console.log(cast instanceof MyPersonClass); // Outputs: true
console.log(cast.spouse instanceof MyPersonClass); // Outputs: true
console.log(cast.siblings[0] instanceof MyPersonClass); // Outputs: true
console.log(cast.siblings[1] instanceof MyPersonClass); // Outputs: true
console.log(cast.siblings[2] instanceof MyPersonClass); // Outputs: true
console.log(cast.parents.mother instanceof MyPersonClass); // Outputs: true
console.log(cast.parents.father instanceof MyPersonClass); // Outputs: true
```

</details>

## @Validate decorator

The `@Validate` decorator provides a simple way of validating properties' values and checking for invalid values across the entire EnTT instance.

All EnTT instances will expose validation methods:

```ts
class MyEntityClass extends EnTT {

  public get valid () => boolean

  public errors () => Record<string, EnttValidationError[]>

}
```

### Validate by data type

Simplest, and very limited way of validating property values is by their type. You can specify the expected type like so:

```ts
@Validate({ type: 'boolean' })

@Validate({ type: 'number' })

@Validate({ type: 'string' })

@Validate({ type: 'object' })
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT } from '@ofzza/entt';

class MyValidClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Validate({ type: 'boolean' })
  public aBoolean = false as boolean;

  @Validate({ type: 'number' })
  public aNumber = 123 as number;

  @Validate({ type: 'string' })
  public aString = 'abc' as string;

  @Validate({ type: 'object' })
  public anObject = {} as object;
}

const instance = new MyValidClass();
console.log(instance.valid); // Outputs: true
console.log(instance.errors); // Outputs: {}

instance.aBoolean = undefined;
instance.aNumber = undefined;
instance.aString = undefined;
instance.anObject = undefined;

console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    aBoolean: [
//      new EnttValidationError({
//        message: 'Value undefined is not of required type "boolean"!'
//      })
//    ]
//    aNumber:  [
//      new EnttValidationError({
//        message: 'Value undefined is not of required type "number"!'
//      })
//    ]
//    aString:  [
//      new EnttValidationError({
//        message: 'Value undefined is not of required type "string"!'
//      })
//    ]
//    anObject: [
//      new EnttValidationError({
//        message: 'Value undefined is not of required type "object"!'
//      })
//    ]
// }
```

</details>

### Validate using a custom validator

To validate against more complex criteria, you can use a custom validator.

#### Custom validator function

The most basic custom validator is just a function evaluating the validity of a property value within the context of the EnTT instance:

```ts
@Validate({ provider: (value, obj) => Error[] | Error | string | boolean }) });
```

<details><summary>EXAMPLE</summary>

```ts
import { EnTT } from '@ofzza/entt';

class MyDatesClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  // Validate year is within a predefined scope
  @Validate({ provider: (value, obj) => value > 1900 && value < 2100 })
  public born?: number = undefined;

  // Validate year is within dynamic scope and throw custom validation errors
  @Validate({
    provider: (value, obj) => {
      const errs = [];
      if (value < obj.born) {
        errs.push(
          new EnttValidationError({
            type: 'custom',
            message: 'Graduation year must be greater than birth date!',
            context: {},
          }),
        );
      }
      if (value >= obj.born) {
        errs.push(
          new EnttValidationError({
            type: 'custom',
            message: 'Graduation year must be smaller than 2100!',
            context: {},
          }),
        );
      }
      return errs;
    },
  })
  public graduated?: number = undefined;
}

const instance = new MyDatesClass();
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        message: 'Value undefined not allowed!'
//      })
//    ]
// }

instance.born = 1800;
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        message: 'Value 1800 not allowed!'
//      })
//    ]
// }

instance.born = 1950;
instance.graduated = 1949;
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    graduated: [
//      new EnttValidationError({
//        type: 'custom',
//        message: 'Graduation year must be greater than birth date!'
//      })
//    ]
// }
```

</details>

#### JOI validator

EnTT will also know to recognize [JOI](https://github.com/hapijs/joi) validation expressions:

```ts
import * as Joi from 'joi';
@Validate({ provider: Joi.any() });
```

<details><summary>EXAMPLE</summary>

```ts
import * as Joi from 'joi';
import { EnTT } from '@ofzza/entt';

class MyDatesClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  // Validate year is within a predefined scope
  @Validate({
    provider: Joi.number().strict().integer().min(1900).max(2100).required(),
  })
  public born?: number = undefined;

  // Validate year is within dynamic scope and throw custom validation errors
  @Validate({
    provider: Joi.number().strict().integer().min(Joi.ref('$.born')).max(2100).required(),
  })
  public graduated?: number = undefined;
}

const instance = new MyDatesClass();
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        type: 'any.required',
//        message: 'Value undefined is required'
//      })
//    ],
//    graduated: [
//      new EnttValidationError({
//        type: 'any.required',
//        message: 'Value undefined is required'
//      })
//    ]
// }

instance.born = 1800;
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        type: 'number.min',
//        message: 'Value 1800 must be larger than or equal to 1900'
//      })
//    ],
//    graduated: [
//      new EnttValidationError({
//        type: 'any.required',
//        message: 'Value undefined is required'
//      })
//    ]
// }

instance.born = 1950;
instance.graduated = 1949;
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    graduated: [
//      new EnttValidationError({
//        type: 'any.ref',
//        message: 'Value 1949 limit references "ref:global:.born" which must be a number'
//      })
//    ]
// }
```

</details>

#### YUP validator

EnTT will also know to recognize [YUP](https://github.com/jquense/yup) validation expressions:

```ts
import * as Yup from 'yup';
@Validate({ provider: Yup.any() });
```

<details><summary>EXAMPLE</summary>

```ts
import * as Yup from 'yup';
import { EnTT } from '@ofzza/entt';

class MyDatesClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  // Validate year is within a predefined scope
  @Validate({
    provider: Yup.number().strict().integer().min(1900).max(2100).required(),
  })
  public born?: number = undefined;

  // Validate year is within dynamic scope and throw custom validation errors
  @Validate({
    provider: Yup.number()
      .strict()
      .integer()
      .min(Yup.ref('$.born') as any)
      .max(2100)
      .required(),
  })
  public graduated?: number = undefined;
}

const instance = new MyDatesClass();
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        type: 'required',
//        message: 'Value undefined is a required field'
//      })
//    ],
//    graduated: [
//      new EnttValidationError({
//        type: 'required',
//        message: 'Value undefined is a required field'
//      })
//    ]
// }

instance.born = 1800;
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        type: 'min',
//        message: 'Value 1800 must be greater than or equal to 1900'
//      })
//    ],
//    graduated: [
//      new EnttValidationError({
//        type: 'required',
//        message: 'Value undefined is a required field'
//      })
//    ]
// }

instance.born = 1950;
instance.graduated = 1949;
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    graduated: [
//      new EnttValidationError({
//        type: 'min',
//        message: 'Value 1949 must be greater than or equal to 1950'
//      })
//    ]
// }
```

</details>

### Validate using a multiple custom validators

On top of being able to set a custom validation provider, you can also set an array of multiple custom validation providers all of which will be evaluated in turn. This allows you to mix and match between different validation methods for the same property:

```ts
import * as Joi from 'joi';
import * as Yup from 'yup';

@Validate({
  provider: [
    (value, obj) => Error[] | Error | string | boolean }),
    Joi.any(),
    Yup.any()
  ]
});
```

<details><summary>EXAMPLE</summary>

```ts
import * as Joi from 'joi';
import * as Yup from 'yup';
import { EnTT } from '@ofzza/entt';

class MyDatesClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  // Validate year is within a predefined scope
  @Validate({
    provider: [
      (value, obj) => value > 1900 && value < 2100,
      Joi.number().strict().integer().min(1900).max(2100).required(),
      Yup.number().strict().integer().min(1900).max(2100).required(),
    ],
  })
  public born?: number = undefined;
}

const instance = new MyDatesClass();
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        message: 'Value undefined not allowed!'
//      })
//      new EnttValidationError({
//        type: 'any.required',
//        message: 'Value undefined is required'
//      }),
//      new EnttValidationError({
//        type: 'required',
//        message: 'Value undefined is a required field'
//      })
//    ],
// }

instance.born = 1800;
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    born: [
//      new EnttValidationError({
//        message: 'Value 1800 not allowed!'
//      }),
//      new EnttValidationError({
//        type: 'number.min',
//        message: 'Value 1800 must be larger than or equal to 1900'
//      }),
//      new EnttValidationError({
//        type: 'min',
//        message: 'Value 1800 must be greater than or equal to 1900'
//      })
//    ]
// }
```

</details>

### Validating nested class instances

When nesting EnTT classes, invalid nested instances will automatically invalidate their parents.

<details><summary>EXAMPLE</summary>

```ts
import { EnTT } from '@ofzza/entt';

class MyNestedClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Validate({ provider: Yup.number().strict().required() })
  public aNumber?: number = undefined;
}

class MyParentClass extends EnTT {
  constructor() {
    super();
    super.entt();
  }

  @Validate({ provider: Yup.boolean().strict().required() })
  public aBoolean?: boolean = undefined;

  public nested = new MyNestedClass();
}

const instance = new MyParentClass();
(instance as any).aBoolean = 'abc';
((instance as any).nested as any).aNumber = 'abc';
console.log(instance.valid); // Outputs: false
console.log(instance.errors);
// Outputs: {
//    aBoolean: [
//      new EnttValidationError({
//        type: 'typeError',
//        message: 'Value "abc" must be a `boolean` type, but the final value was: `"abc"`.'
//      })
//    ],
//    nested.aNumber: [
//      new EnttValidationError({
//        type: 'typeError',
//        message: 'Value "abc" must be a `number` type, but the final value was: `"abc"`.'
//      })
//    ]
// }
```

</details>

# Contributing

## Reporting Issues

When reporting issues, please keep to provided templates.

Before reporting issues, please read: [GitHub Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/github.md)

## Contributing Code

For work-flow and general etiquette when contributing, please see:

- [Git Source-Control Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/git.md)
- [GitHub Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/github.md)

Please accompany any work, fix or feature with their own issue, in it's own branch (see [Git Source-Control Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/git.md) for branch naming conventions), and once done, request merge via pull request.

When creating issues and PRs, please keep to provided templates.
