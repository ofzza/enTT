# enTT

**enTT**, short for Entity, is an extensible JS class implementing some of the often used data-model functionality.

## Get enTT
TODO: ... how to get, install, include into your project ...

## Usage

> For the TL;DR version, see Examples at the bottom!

The Entity class is not meant to be instantiated directly; instead it is supposed to be extended into your own, custom data-model classes. When extending the Entity class, there are static properties that can be set to configure the behavior of the extended class:

- **propertyDefinitions** static property can return property definition for your extended class. These definitions define managed properties that will be created and handled by each instance of the class.

```js
  // Import Entity base class
  import enTT from 'enTT';

  // Define a model class with vanilla, unconfigured properties
  class MyBase extends enTT {
    // Define two vanilla properties
    static get propertyDefinitions () { return ['propVanillaA', 'propVanillaB']; }
  }
  // Extend your model class with additional, configured properties
  class MyModel extends MyBase {
    // Define additional, configured properties
    static get propertyDefinitions () {
      return {
        configuredProperty: { /*... property configuration ...*/ }
      };
    }
  }

  // Instantiate the class and check properties
  let model = new MyModel();
  // TODO: ...  
```

> More on different types of properties and their configuration a bit later ...

- **modules** static property can also return a Module instance (or array of Module instances) which will be used to augment behavior of your extended class.

```js
  // Import Entity base class
  import enTT from 'enTT';

  // Define a model class augmented by some module
  class MyBase extends enTT {
    // Set used modules
    static get modules () {
      return [ new SomeModule(moduleConfiguration) ];
    }
  }
  // Extend your model class with an additional module
  class MyModel extends MyBase {
    // Set more used modules
    static get modules () {
      return [ new SomeOtherModule(otehrModuleConfiguration) ];
    }
  }
```

> You can also create your own, custom Modules - more on that, and all the prepackaged modules a bit later ...

### Property types and configuration

When defining your data-model class' managed properties using the **propertyDefinitions** static property on your class, there are different proeprty types you can define:

##### Value property

Value property is the default property type whose getter and setter can accept and hold any value or object.

##### Dynamic property

Dynamic property is a dynamically calculated, read-only property type defined by a function generating it's value based off of values of other properties in the entity instance.

A dynamic property can be defined explicitelly using the "**dynamic**" key:

```js
  ...
  firstName: {
    dynamic: function () { return this.fullName.split(' ')[0]; }
  }
  ...
```

... or, if no other property configuration is needed, by a short-hand, passing the function in place of the entire property definition:

```js
  ...
  firstName: function () { return this.fullName.split(' ')[0];
  ...
```

A dynamic property will be recalculated when ever a change to the properties it's depending on is detected. If defining a dynamic property using the explicit syntax, you can specify the proeprties it's dpending on using the "**dependencies**" key:

```js
  ...
  firstName: {
    dynamic: function () { return this.fullName.split(' ')[0]; }
    dependencies: ['fullName']
  }
  ...
```

If dependencies aren't explicitly specified, the dynamic property will be recalculated on any change to any property.

> **Note**: dynamic property's function definitions needs to be a full-bodied function definition, and not an abreviated lambda function, so that it can be bound to the right "this" reference, allowing it to get values of other properties on the Entity instance.

##### Casting property

Casting property is a property which will try to cast any value that is set to it as an Entity instance of a configured type, or as a collection of Entity instances of a configured type.

A casting property can be defined explicitly using the "**castAs**" key:

```js
  ...
  // Will convert any value being set into: new MyEntity()
  castSingle: { castAs: MyEntity },
  // Will convert any collection being set into: [ new MyEntity(), ... ]
  castCollection: { castAs: MyEntity, collection: true }
  ...
```

... or, if no other property configuration is needed, by a short-hand, passing only the Entity class the property should cast to:

```js
  ...
  // Will convert any value being set into: new MyEntity()
  castSingle: MyEntity,
  // Will convert any collection being set into: [ new MyEntity(), ... ]
  castCollection: [ MyEntity ]
  ...
```

### Modules: Prepackaged modules

##### Key Property Value

Key Property Value module allows for marking of properties as primary key values, making them unique identifiers of the entity:

```
 idA: { key: true }
 idB: { key: true }
```

Using the **entity.uniqueKey** property, you can access a unique identifier of the entity generated from all of the entity's key properties:

```js
  myEntity.idA = 'A';
  myEntity.idB = 'B';
  myEntity.uniqueKey    // will now equal: '{"idA":"A","idB":"B"}'

```

##### Default Propery Value

Default Propery Value module initializes properties with an initial, default value configured by the property definition's **value** key:

```js
  ...
  score: { value: 0 }
  ...
```

The module is included in all Entities by default and doesn't require you to add it via the static **modules** property.

##### Data management

TODO: Import / Export / Clone

##### Validation

##### Validation via JOI

### Modules: Writing your own, custom module

TODO: ...

### Notifying and being notified of changes

TODO: ...

### Observing changes

Each entity exposes a watcher which you can use to trigger a callback every time a change has been detected to an entity property:

```js
// Watch changes to any property on the entity
entity.watch(
  (e) => {
    console.log(`Property ${e.property} => new value ${e.entity[e.property]}`);
  }
);

// Watch changes to the 'prop' property on the entity
entity.watch(
  (e) => {
    console.log(`Property ${e.property} => new value ${e.entity[e.property]}`);
  },
  'prop'
);

// Watch changes to multiple properties on the entity
entity.watch(
  (e) => {
    console.log(`Property ${e.property} => new value ${e.entity[e.property]}`);
  },
  ['propA', 'propB', 'propC']
);
```

Changes are automatically detected when:
- An entity property get a new value set:

```js
  entity.prop = value;              // Change detected
```
- An embedded entity gets a new property value set:

```js
  entity.prop = new MyModel();      // Change detected
  entity.prop.innerProp = value;    // Change detected
```

Changes are not automatically detected when:
- An embedded non-entity object or array is modified:

```js
// Array
entity.arrayProperty = [];                  // Change detected
entity.arrayProperty.push(value);           // Change NOT detected
entity.arrayProperty[1] = value;            // Change NOT detected
entity.arrayProperty.splice(0,0);           // Change NOT detected
delete entity.arrayProperty[0];             // Change NOT detected
// Object
entity.objectProperty = {};                 // Change detected
entity.objectProperty.innerProp = value;    // Change NOT detected
delete entity.objectProperty.innerProp;     // Change NOT detected
```

When making changes which can't be automatically detected, you should wrap making them in an `.update(() => { ... })` call like this:

```js
// Will trigger all watchers registered with the entity
entity.update(
  () => {
    entity.arrayProperty.push(value);
    entity.objectProperty.innerProp = value;
  }
);

// Will trigger only watchers watching the 'arrayProperty'
entity.update(
  () => {
    entity.arrayProperty.push(value);
    entity.objectProperty.innerProp = value;
  },
  'arrayProperty'
);

// Will trigger watchers watching 'arrayProperty' or 'objectProperty'
entity.update(
  () => {
    entity.arrayProperty.push(value);
    entity.objectProperty.innerProp = value;
  },
  ['arrayProperty', 'objectProperty']
);
```

### Additional functions

##### Casting between entitiy types

Entity class has an exposed static `.cast(value, EntityClass)` method which you can use to cast anything as an Entity type:

```js
// Define an entity class
class MyModel extends Entity {
  static get propertyDefinitions () { return ['propA', 'propB']; }
}

// Cast any data as that entity class
let castEntity = Entity.cast(
  {
    propA: 'Aa1',
    propB: 'Bb2'
    propC: 'Extra property not defined for MyModel class!'
  },
  MyModel
);

// Result of the cast is an instance of the requsted class with all properties copied over
console.log(                              // Outputs:
  (castEntity instanceof castEntity),     //  true
  (castEntity.propA),                     //  "Aa1"
  (castEntity.propB),                     //  "Bb2"
  (castEntity.propC)                      //  undefined
);
```

To cast arrays or other collections use .castCollection(collection, EntityClass) method:

```js
// Define an entity class
class MyModel extends Entity {
  static get propertyDefinitions () { return ['propA', 'propB']; }
}

// Cast any data as that entity class
let castEntityCollection = Entity.castCollection(
  [
    {
      propA: 'Aa1',
      propB: 'Bb1'
      propC: 'Extra property not defined for MyModel class!'
    },
    {
      propA: 'Aa2',
      propB: 'Bb2'
      propC: 'Extra property not defined for MyModel class!'
    },
    {
      propA: 'Aa3',
      propB: 'Bb3'
      propC: 'Extra property not defined for MyModel class!'
    },
  ]
  MyModel
);

// Result of the cast is an instance of the requsted class with all properties copied over
console.log(                              // Outputs:
  (castEntityCollection[1] instanceof castEntity),     //  true
  (castEntityCollection[1].propA),                     //  "Aa2"
  (castEntityCollection[1].propB),                     //  "Bb2"
  (castEntityCollection[1].propC)                      //  undefined
);
```

## Examples

TODO: ...
