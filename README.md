EnTT
======

```EnTT```, pronounced "Entity", is an extensible Javascript data-model implementation with some of the typically required functionality, such as change-detection, easy import/export, composition/decomposition, data validation, etc., all available out of the box.


# Get EnTT

To start using ```EnTT``` in your project, simply install it from NPM by running the following in your terminal:
 ```
 npm install entt --save
 ```


# Reference table

- [How to Use](#how-to-use)
- [Property configuration](#property-configuration)
  - [How to configure properties](#how-to-configure-properties)
  - [Configuration options](#configuration-options)
    - [Value](#value)
    - [Readonly](#readonly)
    - [Exportable](#exportable)
    - [Bind](#bind)
    - [Cast](#cast)
- [Data management](#data-management)
  - [Importing](#importing)
  - [Exporting](#exporting)
  - [Casting](#casting)
    - [Cast a single object as a single entity](#cast-a-single-object-as-a-single-entity)
    - [Cast an array of objects as an array of entities](#cast-an-array-of-objects-as-an-array-of-entities)
    - [Cast a hashmap of objects as a hashmap of entities](#cast-a-hashmap-of-objects-as-a-hashmap-of-entities)
- [Change detection](#change-detection)
  - [Watching for changes](#watching-for-changes)
  - [Manual Update Notification](#manual-update-notification)
  - [Update Batching](#update-batching)
- [Extensions](#extensions)
  - [How to include extensions](#how-to-include-extensions)
  - [Included extensions and how to use them](#included-extensions-and-how-to-use-them)
    - [Dynamic Properties Extension](#dynamic-properties-extension)
    - [Validation Extension](#validation-extension)
  - [Extension Authoring](#extension-authoring)
    - [EnTTExt class](#enttext-class)
    - [EnTTExt class methods](#enttext-class-methods)
      - [.updatePropertyConfiguration(...) method](#updatepropertyconfiguration-method)
      - [.onEntityInstantiate(...) method](#onentityinstantiate-method)
      - [.onChangeDetected(...) method](#onchangedetected-method)
      - [.afterChangeProcessed(...) method](#afterchangeprocessed-method)
      - [.interceptPropertySet(...) method](#interceptpropertyset-method)
      - [.interceptPropertyGet(...) method](#interceptpropertyget-method)


# How to Use

When creating your data-model you should have your classes inherit from the base ```EnTT``` class like:

```js
import EnTT from 'entt';

class MyModel extends EnTT {
 static get includes () { /* Include extensions */ }
 static get props () { /* Configure properties */ }
}
```

or, alternatively, from existing data-model classes, like:

```js
class MyMoreSpecificModel extends MyModel {
 static get includes () { /* Include extensions */ }
 static get props () { /* Configure properties */ }
}
```

When constructing a model instance with ```let instance = new MyMoreSpecificModel()```, the created instance will inherit it's properties' configuration and included extensions from all of the classes it inherits from.

- > _See [Property configuration](#property-configuration) section for details on how to configure your class' properties_

- > _See [Extensions](#extensions) section for details on how to extend ```EnTT``` functionality_


## Property configuration

### How to configure properties

When extending your class from ```EnTT``` you should declare and configure any properties you need your class to contain by defining the ```static get props()``` property of your class:

```js
class MyModel extends EnTT {
  static get props () {
    // Return configuration for all properties
    return {
      foo: { /* ... configuration ... */ },
      bar: { /* ... configuration ... */ },
    };
  }
}
```

- > _See [Property configuration](#property-configuration) > [Configuration options](#configuration-options) section for details on all of the configuration options available out of the box._

- > _See [Extensions](#extensions) > [Included extensions and how to use them](#included-extensions-and-how-to-use-them) section for details on all of the included extensions' configuration options._

- > _See [Extensions](#extensions) > [Extension authoring](#extension-authoring) section for details on how to extend EnTT with your own configuration options and functionality._

Having set up the property configuration, every instance of your class will be created with all of the configured properties (configured on this class or any of the inherited classes) initialized with getters/setters implementing the configured for functionality.

<sub>_**Example**_:</sub>
```js

// Define a 1st level EnTT class
class MyModel extends EnTT {
  static get props () {
    // Configure properties with initial values
    return {
      foo: { value: 'value for FOO' },
      bar: { value: 'value for BAR' }
    };
  }
}

// Inherit into a 2nd level EnTT class
class MyMoreSpecificModel extends MyModel {
  static get props () {
    // Configure properties with initial values
    return {
      foo: { value: 'overridden value for FOO' },
      baz: { value: 'value for BAZ' }
    };
  }
}

// Instantiate the 2nd level class
let instance = new MyMoreSpecificModel();

// Check initial values set
console.log(instance.foo);
  // Outputs "overridden value for FOO", set because of "MyMoreSpecificModel.foo" configuration
console.log(instance.bar);
  // Outputs "value for BAR", set because of "MyModel.bar" configuration
console.log(instance.baz);
  // Outputs "value for BAZ", set because of "MyMoreSpecificModel.baz" configuration
```

### Configuration options

#### Value

```js
foo: { value: 'some value' }
```

The ```value``` configuration option sets an initial value to be assigned to the configured property as soon as the class in instantiated.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class
class MyModel extends EnTT {
  static get props () {
    return {
      // Configure property .foo with a initial value "bar"
      foo: { value: 'bar' }
    };
  }
}

// Construct a single instance and check initial property value
console.log((new MyModel()).foo);   // Outputs initial "bar" value
```

#### Readonly

```js
foo: { readOnly: true }
```

The ```readOnly``` configuration option, when set to true, makes the configured property read-only. When read-only, the property:
- Will be readable
- Will **not** be writable (will throw an error if tried to be assigned a value)
- Will be exported when exporting 
- Will **not** accept imported data
- Will **not** accept data being cast into it

<sub>_**For Example**_:</sub>
```js
// Define an EnTT class
class MyModel extends EnTT {
  static get props () {
    return {
      // Configure a read-only property .foo with a initial value "bar"
      foo: {
        value: 'bar',
        readOnly: true
      }
    };
  }
}

// Construct a single instance
let instance = new MyModel();
// Check if readable
console.log(instance.foo);            // Outputs initial "bar" value
// Check if writable
instance.foo = 'baz';                 // Throws an error
// Check if exported when exporting
console.log(instance.export().foo);   // Outputs unchanged value of "bar"
// Try importing data
instance.import({ foo: 'baz' });
console.log(instance.foo);            // Outputs unchanged value of "bar"
// Try casting to MyModel
let castIntoModel = EnTT.cast({ foo: 'baz' }, MyModel);
console.log(castIntoModel.foo);       // Outputs unchanged value of "bar"
```

#### Exportable

```js
foo: { exportable: true }
```

The ```exportable``` configuration option, when set to false, makes the configured property not exportable. When not exportable, the property:
- Will be readable
- Will be writable
- Will **not** be exported when exporting
- Will **not** accept imported data
- Will accept data being cast into it

<sub>_**Example**_:</sub>
```js
// Define an EnTT class
class MyModel extends EnTT {
  static get props () {
    return {
      // Configure a read-only property .foo with a initial value "bar"
      foo: {
        value: 'bar',
        exportable: false
      }
    };
  }
}

// Construct a single instance
let instance = new MyModel();
// Check if readable
console.log(instance.foo);            // Outputs initial "bar" value
// Check if writable
instance.foo = 'baz';
console.log(instance.foo);            // Outputs assigned "baz" value
// Check if exported when exporting
console.log(instance.export().foo);   // Outputs undefined
// Try importing data
instance.import({ foo: 'qux' });
console.log(instance.foo);            // Outputs unchanged value of "baz"
// Try casting to MyModel
let castIntoModel = EnTT.cast({ foo: 'qux' }, MyModel);
console.log(castIntoModel.foo);       // Outputs cast value of "qux"
```

#### Bind

```js
foo: { bind: 'bar' }
```

The ```bind``` configuration option can configure a property to import/export from/to a property of a different name then itself.

- > _See [Data management](#data-management) > [Importing](#importing) and [Data management](#data-management) > [Exporting](#exporting) sections for details and examples._

#### Cast

```js
foo: { cast: MyModel },
bar: { cast: [ MyModel ] },
baz: { cast: { MyModel } }
```

The ```cast``` configuration option can configure a property to cast any value assigned to it before setting it. The configured value (```MyModel```, ```[ MyModel ]``` or ```{ MyModel }```) sets if the value being set will get cast as a particular EnTT class (```MyModel```), as an array of a particular EnTT class (```[ MyModel ]```) or a hashmap of a particular EnTT class (```{ MyModel }```).

- > _See [Data management](#data-management) > [Casting](#casting) section for details on casting target syntax on how casting works._

<sub>_**Example**_:</sub>
```js
// Define a simple EnTT class to use as a casting target
class MyValue extends EnTT {
  static get props () {
    return {
      val: { }
    };
  }
}

// Define an EnTT class containing casting properties
class MyModel extends EnTT {
  static get props () {
    return {
      // Configure some casting properties
      foo: { cast: MyValue },
      bar: { cast: [ MyValue ] },
      baz: { cast: { MyValue } },
    };
  }
}

// Instantiate the class
let instance = new MyModel();

// Assign value to cast property
instance.foo = { val: 1 };
console.log((instance.foo instanceof MyValue), Object.keys(instance.foo), Object.values(instance.foo));
  // Outputs true, [ "val" ], [ 1 ]
  // The set raw object was cast as MyValue instance

// Assign array of values to cast property
instance.bar = [ { val: 0 }, { val: 1 }, { val: 2 } ];
console.log((instance.bar[0] instanceof MyValue), Object.keys(instance.bar[0]), Object.values(instance.bar[0]));
  // Outputs true, [ "val" ], [ 0 ]
console.log((instance.bar[1] instanceof MyValue), Object.keys(instance.bar[1]), Object.values(instance.bar[1]));
  // Outputs true, [ "val" ], [ 1 ]
console.log((instance.bar[2] instanceof MyValue), Object.keys(instance.bar[2]), Object.values(instance.bar[2]));
  // Outputs true, [ "val" ], [ 2 ]
  // The set array of raw objects was cast as array of MyValue instances

// Assign hashmap of values to cast property
instance.baz = { a: { val: 0 }, b: { val: 1 } };
console.log((instance.baz.a instanceof MyValue), Object.keys(instance.baz.a), Object.values(instance.baz.a));
  // Outputs true, [ "val" ], [ 0 ]
console.log((instance.bar.b instanceof MyValue), Object.keys(instance.bar.b), Object.values(instance.bar.b));
  // Outputs true, [ "val" ], [ 1 ]
  // The set hashmap of raw objects was cast as hashmap of MyValue instances
```

- >_Note: It is possible to define casting properties using a shorthand syntax, provided you don't require setting any other configuration options for that same property. The following 2 examples will be interpreted the same way:_
  >
  > <sub>Example: </sub>
  > ```js
  > static get props () {
  >   return {
  >     // Configure some casting properties
  >     foo: { cast: MyValue },
  >     bar: { cast: [ MyValue ] },
  >     baz: { cast: { MyValue } },
  >   };
  > }
  > ```
  > ```js
  > static get props () {
  >   return {
  >     // Configure some casting properties using shorthand syntax
  >     foo: MyValue,
  >     bar: [ MyValue ],
  >     baz: { MyValue },
  >   };
  > }
  > ```

## Data management

### Importing

Every instance of a ```EnTT``` exposes a ```.import(data: Object)``` method. By passing either another entity instance or any other object to the ```.import(data: Object)``` method, the data from the passed object will get imported into the instance.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use as an import target
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { },
      bar: { readOnly: true },
      baz: { exportable: false }
    };
  }
}

// Instantiate the class and import raw data
let instance = (new MyModel()).import({
  foo: 'FOO',   // Targeting import to a simple property
  bar: 'BAR',   // Targeting import to a read-only property
  baz: 'BAZ',   // Targeting import to a non-exportable property
  qux: 'QUX'    // Targeting import to a not define property
});

// Check imported properties
console.log(instance.foo);  // Outputs imported value "FOO"
console.log(instance.bar);  // Outputs undefined because can't import to read-only property
console.log(instance.baz);  // Outputs undefined because can't import to a not exportable property
console.log(instance.qux);  // Outputs undefined because can't import to a non-existant property
```

To map properties of different name when importing, you can configure your properties with the ```bind``` option making them import values from the configured property name instead of from a property of the same name:

```js
foo: { bind: 'bar' }
```

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use as a mapped import target
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { bind: 'bar' },
      bar: { bind: 'baz' }
    };
  }
}

// Instantiate the class and import raw data
let instance = (new MyModel()).import({
  bar: 'BAR',   // Targeting mapped import into .foo
  baz: 'BAZ',   // Targeting mapped import into .bar
});

// Check imported properties
console.log(instance.foo);  // Outputs "BAR", imported value from .bar
console.log(instance.bar);  // Outputs "BAZ", imported value from .baz
```

### Exporting

Every instance of a ```EnTT``` class exposes a ```.export()``` method. When called, the method will extract all of the entity instance's property values and return them packaged up as a raw object.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use as an exporting source
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { value: 'FOO' },
      bar: { value: 'BAR', readOnly: true },
      baz: { value: 'BAZ', exportable: false }
    };
  }
}

// Instantiate the class and export raw data
let exported = (new MyModel()).export();

// Check exported properties
console.log(exported.foo);  // Outputs initial value "FOO"
console.log(exported.bar);  // Outputs initial value "BAR"
console.log(exported.baz);  // Outputs undefined because can't export a not exportable property
```

To map properties of different name when exporting, you can configure your properties with the ```bind``` option making them export values to the configured property name instead of to a property of the same name:

```js
foo: { bind: 'bar' }
```

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use as a mapped exporting source
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { value: 'FOO', bind: 'bar' },
      bar: { value: 'BAR', bind: 'baz' }
    };
  }
}

// Instantiate the class and export raw data
let exported = (new MyModel()).export();

// Check exported properties
console.log(exported.foo);  // Outputs undefined
console.log(exported.bar);  // Outputs "FOO", exported value from .foo
console.log(exported.baz);  // Outputs "BAR", imported value from .bar
```

### Casting

You can quickly convert between raw objects and instances of an ```EnTT``` class by using the ```EnTT.cast(rawData, TargetClassSyntax)``` method. You can also cast between different ```EnTT``` classes.

Assuming you have defined an extended ```EnTT``` class with some properties like:

```js
// Define an EnTT class to use as a casting target
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { },
      bar: { }
    };
  }
}
```

using ```EnTT.cast(rawData, TargetClassSyntax)``` method, you can:

#### Cast a single object as a single entity

To cast as a single entity you'll need to call ```EnTT.cast(rawData, TargetClassSyntax)``` with the following arguments:
- ```rawData```: Should contain a single raw object to be cast\
  _Example_: ```{ foo: 'bar' }```
- ```TargetClassSyntax```: Should contain the ```EnTT``` extended class you're casting as\
  _Example_: ```MyModel```

<sub>_**Example**_:</sub>
```js
// Cast a raw object as a single entity
let rawData = { foo: 'FOO', bar: 'BAR' },
    castEntity = EnTT.cast(rawData, MyModel);

// Check cast entity
console.log((castEntity instanceof MyModel), castEntity.foo, castEntity.bar);
  // Outputs: true, "FOO", "BAR"
```

#### Cast an array of objects as an array of entities

To cast as an array of entities you'll need to call ```EnTT.cast(rawData, TargetClassSyntax)``` with the following arguments:
- ```rawData```: Should contain a collection of raw objects to be cast,\
  _Example_: ```[{ foo: 'bar' }, { foo: 'baz' }]```
- ```TargetClassSyntax```: Should contain an array literal, containg the ```EnTT``` extended class you're casting as as it's only member,\
  _Example_: ```[ MyModel ]```

<sub>_**Example**_:</sub>
```js
// Cast a raw object array as an entity array
let rawData = [
      { foo: 'FOO', bar: 'BAR' },
      { foo: 'BAZ', bar: 'QUX' }
    ],
    castEntityArray = EnTT.cast(rawData, [ MyModel ]);

// Check cast entity array
console.log(castEntityArray.length);
  // Outputs 2
console.log(castEntityArray[0] instanceof MyModel), castEntityArray[0].foo, castEntityArray[0].bar);
  // Outputs: true, "FOO", "BAR"
console.log(castEntityArray[1] instanceof MyModel), castEntityArray[1].foo, castEntityArray[1].bar);
  // Outputs: true, "BAZ", "QUX"
```

#### Cast a hashmap of objects as a hashmap of entities

To cast as a hashmap of entities you'll need to call ```EnTT.cast(rawData, TargetClassSyntax)``` with the following arguments:
- ```rawData```: Should contain a hashmap of raw objects to be cast,\
  _Example_: ```{ a: { foo: 'bar' }, b: { foo: 'baz' } }```
- ```TargetClassSyntax```: Should contain a hashmap literal, containg the ```EnTT``` extended class you're casting as as it's only property value,\
  _Example_: ```{ MyModel: MyModel }``` or just ```{ MyModel }```

<sub>_**Example**_:</sub>
```js
// Cast a raw object hashmap as an entity hashmap
let rawData = {
      waldo:  { foo: 'FOO', bar: 'BAR' },
      fred:   { foo: 'BAZ', bar: 'QUX' }
    },
    castEntityHashmap = EnTT.cast(rawData, { MyModel });

console.log(Object.values(castEntityHashmap.length));
  // Outputs: 2
console.log(castEntityHashmap.waldo instanceof MyModel), castEntityHashmap.waldo.foo, castEntityHashmap.waldo.bar);
  // Outputs: true, "FOO", "BAR"
console.log(castEntityHashmap.fred instanceof MyModel), castEntityHashmap.fred.foo, castEntityHashmap.fred.bar);
  // Outputs: true, "BAZ", "QUX"
```


## Change detection

Every instance of an ```EnTT``` class has build in data-change detection allowing you to subscribe to get notified of changes to any of the ```EnTT``` instance's properties' values.

### Watching for changes

To subscribe to data-changes on an instance, you can use the ```.watch(watcherFn: function)``` method, exposed on every ```EnTT``` instance.

```js
let cancel = instance.watch((e) => { ... })
```

The ```.watch(...)``` method takes a change event handler function as its only argument and returns a callback which cancels the subscription when called.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use for change detection
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { value: 'FOO' }
    };
  }
}

// Instantiate an instance and subscribe to changes
let instance = new MyModel(),
    cancel = instance.watch((e) => {
      console.log(
        (e.source === instance),  // Source will be the instance which detected a change
        e.propertyName,           // Property which changed
        e.oldValue,               // Old property value before the change
        e.newValue                // New property value after the change
      );
    });

// Update instance
instance.foo = 'BAR';
  // Change event handler outputs: true, "foo", "FOO", "BAR"
instance.foo = 'BAZ';
  // Change event handler outputs: true, "foo", "BAR", "BAZ"

// Cancel the subscription
cancel();

// Update instance
instance.foo = 'QUX';   // No output from change event handler

```

In cases where you're embedding instances of ```EnTT``` into another ```EnTT```'s properties, detected changes will propagate from the nested child entity through to parent entities.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use for change detection
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { value: 'FOO' },
      bar: { value: 'BAR' }
    };
  }
}

// Nest 3 levels of instances and watch top level instance for changes
let instance = new MyModel();         // Top level instance
instance.foo = new MyModel();         // 2nd level instance, nested as instance.foo 
instance.foo.bar = new MyModel();     // 3rd level instance, nested as instance.foo.bar
instance.watch((e) => {               // Watch top level instance for changes
  console.log(
    (e.source === instance),  // Source will be the instance which detected a change
    e.propertyName,           // Property which changed
    e.oldValue,               // Old property value before the change
    e.newValue,               // New property value after the change
    e.innerEvent              // Reference to the change event of the child instance
  );
});

// Update 2nd level instance
instance.foo.foo = 'BAR';
  // Change event handler outputs:
  // true, "foo", null, null, {
  //   source: [instance.foo],
  //   propertyName: "foo",
  //   oldValue: "FOO",
  //   newValue: "BAR"
  // }
instance.foo.bar.foo = 'BAZ';
  // Change event handler outputs:
  // true, "foo", null, null, {
  //   source: [instance.foo],
  //   propertyName: "bar",
  //   oldValue: null,
  //   newValue: null,
  //   innerEvent: {
  //     source: [instance.foo.bar]
  //     propertyName: "foo",
  //     oldValue: "FOO",
  //     newValue: "BAZ"
  //   }
  // }

```

### Manual Update Notification

While ```EnTT``` instances will detect any value assignments you make to properties of ```EnTT``` instances themselves, there are some types of changes that can't be detected automatically:
- Change, addition or deletion of internal properties of an object assigned as ```EnTT``` instance property value.
- Change, addition or deletion to members of an array assigned as ```EnTT``` instance property value
- Changes to instances of any class other than ```EnTT``` assigned as ```EnTT``` instance property value.
- Changes to instances of ```EnTT``` nested deeper within data assigned as ```EnTT``` instance property value.

To make sure change detection still triggers when making these types of updates, you can manually notify the ```EnTT``` of the changes you've made by calling the ```.update()``` method.

- > _Note: The change event called this way will have the ```.propertyName``` property equal to ```false``` and will not contain any values for ```.oldValue``` or ```.newValue``` properties. When this is the case, change handler functions should act as if anything could have changed on the instance._

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use for change detection
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { }
    };
  }
}

// Instantiate an instance and subscribe to changes
let instance = new MyModel();
instance.watch((e) => {
  console.log('Change detected!');
});

// Set an object as property value
instance.foo = { foo: 'FOO', bar: 'BAR' };  // Outputs: "Change detected!"
instance.foo.bar = 'BAZ';                   // No output, can't detect changes to embedded properties
instance.foo.baz = 'BAZ';                   // No output, can't detect creation of new embedded properties
delete instance.foo.bar;                    // No output, can't detect deletion of embedded properties
// Manually notify of changes to trigger watchers
instance.update();                          // Outputs: "Change detected!"

// Set an array as property value
instance.foo = [0, 1, 2, 3, 4];             // Outputs: "Change detected!"
instance.foo[2] = 20;                       // No output, can't detect changes to array members
instance.foo.push(5);                       // No output, can't detect addition of array members
instance.foo.splice(1, 1);                  // No output, can't detect removal of array members
// Manually notify of changes to trigger watchers
instance.update();                          // Outputs: "Change detected!"

// Set a foreign class instance as property value
instance.foo = new Date();                  // Outputs: "Change detected!"
instance.foo.setFullYear(1970);             // No output, can't detect changes within non-EnTT instances
instance.update();                          // Outputs: "Change detected!"

// Embed as EnTT instance deeper within data as property value
instance.foo = { bar: new MyModel() };      // Outputs: "Change detected!"
instance.foo.bar.foo = 'QUX';               // No output, can't propagate EnTT change through a non.EnTT object
instance.update();                          // Outputs: "Change detected!"
```

### Update Batching

When making a series of consequitive changes to the same instance it can be practical not to trigger all of the watchers on every change, but only to have them all trigger once, after the last change was made. To accomplish this use the ```.update(batchFn: function)``` form of the method.

When called with a function as its only argument, the ```.update(batchFn: function)``` method will suppress triggering any change watchers until the function arguments has been executed. This way you can do any number of updates within the passed function only triggering change watchers once, after the updates were made.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class to use for change detection
class MyModel extends EnTT {
  static get props () {
    return {
      foo: { },
      bar: { },
      baz: { }
    };
  }
}

// Instantiate an instance and subscribe to changes
let instance = new MyModel();
instance.watch((e) => {
  console.log('Change detected!');
});

// Make multiple changes without batching
instance.foo = 'FOO';   // Outputs: "Change detected!"
instance.bar = 'BAR';   // Outputs: "Change detected!"
instance.baz = 'BAZ';   // Outputs: "Change detected!"

// Batch a number of changes
instance.update(() => {
  instance.foo = 'FOO';   // No output
  instance.bar = 'BAR';   // No output
  instance.baz = 'BAZ';   // No output
});                       // Outputs: "Change detected!"
```


# Extensions


## How to include extensions

When extending your class from ```EnTT``` you can include extensions onto the class to provide additional functionality by defining the ```static get includes()``` property of your class:

```js
class MyModel extends EnTT {
  static get includes () {
    return [
      // Extensions can be included as classes
      MyExtension,
      // ... or as instances if the extension needs to be configured before inclusion
      new MyOtherExtension({ foo: 'bar' })
    ];
  }
}
```

Having included extensions, every instance of your class will contain additional functionality provided by the included extensions (included on this class or any of the inherited classes).

## Included extensions and how to use them

Some extensions are already packaged up in the ```EnTT``` library and can be imported and used out of the box ...

### Dynamic Properties Extension

```js
import { DynamicPropertiesExtension } from 'entt';

class MyModel extends EnTT {
  static get includes () {
    return [ DynamicPropertiesExtension ];
  }
  static get props () {
    return {
      foo: {
        dynamic: (entity) => {
          return [`value generated based on entity's other properties`];
        }
      }
    }
  }
}
```

```DynamicPropertiesExtension```, when included in your class, adds an additional property configuration option ```dynamic```. When a property is marked as ```dynamic```, with a function as its configured value, the property becomes read-only and dynamically assigns itself a value based on returned value the function provided. This pattern can be used to add additional proeprties whose values are based off of values of other proeprties of the entity.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class with dynamic properties
class MyModel extends EnTT {
  static get includes () {
    return [ DynamicPropertiesExtension ];
  }
  static get props () {
    return {
      firstName: {},      // Standard property
      lastName: {},       // Standard property
      fullName: {         // Dynamic proeprty
        // Make this property dynamic
        dynamic: (entity) => {
          // Compose full name from first and last names
          return `${entity.firstName} ${entity.lastName}`;
        }
      }
    };
  }
}

// Instantiate an instance and set some values
let instance = new MyModel();
instance.firstName = 'Homer';
instance.lastName = 'Simpson';

// Check the dynamic property
console.log(instance.fullName);     // Outputs "Homer Simpson"
```

- > _Note: It is possible to define dynamic properties using a shorthand syntax, provided you don't require setting any other configuration options for that same property. The following 2 examples will be interpreted the same way:_
  >
  > <sub>Example: </sub>
  > ```js
  > static get props () {
  >   return {
  >     // Configure a dynamic property
  >     foo: { dynamic: (entity) => { return 'a dynamic value'; } },
  >   };
  > }
  > ```
  > ```js
  > static get props () {
  >   return {
  >     // Configure a dynamic property using shorthand syntax
  >     foo: (entity) => { return 'a dynamic value'; },
  >   };
  > }
  > ```

- > _Note: When including ```DynamicPropertiesExtension``` into your class it is possible to preconfigre it with the ```deferred``` argument. If set to true the extension will regenerate the value of the dynamic property every time the value is fetched from the property instead of it's default behavior where it regenerates the dynamic value every time there is a change detected on the entity. If you'll be writing to properties of the entity frequently, but will only be reading from the dynamic property rarely, you'll get the same behavior with better performance if you configure the extension as ```deferred: true```._
  >
  > <sub>Example: </sub>
  > ```js
  > static get includes () {
  >   return [ new DynamicPropertiesExtension({ deferred: true }) ];
  > }
  > ```

### Validation Extension

```js
import { ValidationExtension } from 'entt';

class MyModel extends EnTT {
  static get includes () {
    return [ ValidationExtension ];
  }
  static get props () {
    return {
      foo: {
        validate: (value, entity) => {
          if (['invalid value']) {
            return 'Validation error message';
          }
        }
      }
    }
  }
}
```

```ValidationExtension```, when included in your class, adds an additional property configuration option ```validate```. When a property is marked as ```validate```, with a function as its configured value, the property will use the function to validate it's set value on every value change.

<sub>_**Example**_:</sub>
```js
// Define an EnTT class with validated properties
class MyModel extends EnTT {
  static get includes () {
    return [ ValidationExtension ];
  }
  static get props () {
    return {
      lastName: {
        value: 'simpson',
        validate: (value) => {
          // Check if value starts with a capital letter
          if (!value || !value.length || value[0] !== value[0].toUpperCase()) {
            //  Return validation erorr message
            return `Value "${value}" needs to be capitalized!`;
          }
        }
      }
    };
  }
}

// Instantiate an instance
let instance = new MyModel();

// Check initial value and validation
console.log(instance.lastName);                     // Outputs "simpson"
console.log(!!instance.validation.lastName);        // Outputs true, meaning there is a validation error
console.log(instance.validation.lastName.property); // Outputs "lastName"
console.log(instance.validation.lastName.value);    // Outputs "simpson"
console.log(instance.validation.lastName.message);  // Outputs "Value "simpson" needs to be capitalized!"

// Update value to pass validation
instance.lastName = 'Simpson';
// Check value and validation
console.log(instance.lastName);                     // Outputs "Simpson"
console.log(!!instance.validation.lastName);        // Outputs false, meaning there is no validation error

// Update value to fail
instance.update(() => {
  instance.lastName = instance.lastName.toLowerCase();
});
// Check value and validation
console.log(instance.lastName);                     // Outputs "simpson"
console.log(!!instance.validation.lastName);        // Outputs true, meaning there is a validation error
console.log(instance.validation.lastName.property); // Outputs "lastName"
console.log(instance.validation.lastName.value);    // Outputs "simpson"
console.log(instance.validation.lastName.message);  // Outputs "Value "simpson" needs to be capitalized!"
```

- > _Note: When including ```ValidationExtension``` into your class it is possible to preconfigre it with the ```reject``` argument. If set to true the extension will reject all values failing validation and will keep previous value in the property; validation error will still get set._
  >
  > <sub>Example: </sub>
  > ```js
  > static get includes () {
  >   return [ new ValidationExtension({ reject: true }) ];
  > }
  > ```

## Extension authoring

### EnTTExt class

To author your own ```EnTT``` extension, you'll need to extend it from the ```EnTTExt``` class.

```js
import { EnTTExt } from 'entt';

// Declare my extension class
class MyExtension extends EnTTExt { ... }
```

Your extension can now be included into any ```EnTT``` classm but it won't do anything. To implement functionality for your extension you need to declare and implemet at least one of the optional methods that will get called at appropriate time by every ```EnTT``` instance.

### EnTTExt class methods

In it's constructor your extension needs to declare which of the available optional methods it is implementing, by making a ```super({...})``` call with the appropriate parameters, such as:

```js
import { EnTTExt } from 'entt';

// Declare my extension class
class MyExtension extends EnTTExt {

  // Declare which methods are implemented in the constrcutor
  constructor () {
    super({
      // MyExtension implements .updatePropertyConfiguration() method
      updatePropertyConfiguration: true,
      // MyExtension implements .onChangeDetected() method
      onChangeDetected: true
    })
  }

  // Implement .updatePropertyConfiguration(...) method as was declared
  updatePropertyConfiguration () { ... }

  // Implement .updatePropertyConfiguration(...) method as was declared
  updatePropertyConfiguration () { ... }

}
```

- > _Note: Your extension will only be instantiated once per class (or multiple inheriting classes), not once per instance, so make sure you aren't saving any single ```EnTT``` instance dependent state inside your extension. If you absoutely must to store and pass values between methods of your extension - and it is recemended that you don't - you can do it by defining an additional property on the entity instance (by using the .onEntityInstantiate(...) method) and then using that property to store and pass values._

#### .updatePropertyConfiguration(...) method
```js
// Do changes to property configuration
// For example: If property is marked with configuration option "color" make all default values
//              for hex color values capitalized
updatePropertyConfiguration (propertyConfiguration) {
  // Check if property is marked as a color property
  if (propertyConfiguration.color) {
    // Check if initial value set for property and if it's a valid hex color value 
    const isLongColorValue  = /^#[0-9A-F]{6}$/i.test(propertyConfiguration.value),
          isShortColorValue = /^#[0-9A-F]{3}$/i.test(propertyConfiguration.value);
    if (isLongColorValue || isShortColorValue) {
      // Capitalize hex coolor value
      propertyConfiguration.value = propertyConfiguration.value.toUpperCase();
    }
  }
}
```

#### .onEntityInstantiate(...) method
```js
// Make changes to the EnTT instance being exteded
// For example: Add a method which will calculate the average color of all the "color" properties
onEntityInstantiate (entity, properties) {

  // Attach new properties containing the latest color change timestamp and latest watchers processing timestamp
  let mtime = Date.now(),
      ptime = mtime;
  Object.defineProperty(entity, 'mtime', {
    configurable: false,
    enumerable: false,
    set: (value) => { mtime = value; },
    get: () => { return mtime; }
  });
  Object.defineProperty(entity, 'ptime', {
    configurable: false,
    enumerable: false,
    set: (value) => { ptime = value; },
    get: () => { return ptime; }
  });

  // Attach a new method calculating and returning average color
  entity.getAverageColor = () => {
    const average = _.reduce(properties, (average, propertyConfiguration, propertyName) => {
      let propertyValue = entity[propertyName],
          isLongColorValue  = /^#[0-9A-F]{6}$/i.test(propertyValue),
          isShortColorValue = /^#[0-9A-F]{3}$/i.test(propertyValue);
      if (propertyConfiguration.color && (isLongColorValue || isShortColorValue)) {
        if (propertyValue.length === 7) {
          average.r += parseInt(propertyValue.substr(1, 2), 16);
          average.g += parseInt(propertyValue.substr(3, 2), 16);
          average.b += parseInt(propertyValue.substr(5, 2), 16);
          average.count++;
        } else if (propertyValue.length === 4) {
          average.r += 0x11 * parseInt(propertyValue.substr(1, 1), 16);
          average.g += 0x11 * parseInt(propertyValue.substr(2, 1), 16);
          average.b += 0x11 * parseInt(propertyValue.substr(3, 1), 16);
          average.count++;
        }
      }
      return average;
    }, { count: 0, r: 255, g: 255, b: 255 });
    const red   = (average.r / (average.count || 1)).toString(16),
          green = (average.g / (average.count || 1)).toString(16),
          blue  = (average.b / (average.count || 1)).toString(16);
    return `#${ red }${ green  }${ blue  }`;
  };

}
```

#### .onChangeDetected(...) method
```js
onChangeDetected (entity, properties, event) {
  // Check if not a nested chanege and if changed property is marked as a color property
  if (event.propertyName && properties[event.propertyName].color) {
    // Update last modified time before all the watchers' handlers get to trigger
    entity.mtime = Date.now();
  }
```

#### .afterChangeProcessed(...) method
```js
afterChangeProcessed (entity, properties, event) {
  // Check if not a nested chanege and if changed property is marked as a color property
  if (event.propertyName && properties[event.propertyName].color) {
    // Update last processing time after all the watchers' handlers got to trigger
    entity.ptime = Date.now();
  }
}
```

#### .interceptPropertySet(...) method
```js
// Set up property value setter interceptor
// For example: If property is marked with configuration option "color" make all values for
//              hex color values capitalized
interceptPropertySet (propertyName, propertyConfiguration) {
  // Check if property is a "color" property and only set up interceptor if it is
  if (propertyConfiguration.color) {
    // Intercept property setter and update value if hex color value
    return (entity, properties, event) => {
      // Check if value set for property and if it's a valid hex color value 
      const isLongColorValue  = /^#[0-9A-F]{6}$/i.test(event.value),
            isShortColorValue = /^#[0-9A-F]{3}$/i.test(event.value);
      if (isLongColorValue || isShortColorValue) {
        // Capitalize hex color value
        event.value = event.value.toUpperCase();
      }
    };
  }
}
```

#### .interceptPropertyGet(...) method
```js
// Set up property value getter interceptor
// For example: If property is marked with configuration option "color" replace familiar
//              hex values with color names
interceptPropertyGet (propertyName, propertyConfiguration) {
  // Check if property is a "color" property and only set up interceptor if it is
  if (propertyConfiguration.color) {
    // Intercept property getter and replace hex color value with color name when possible
    return (entity, properties, event) => {
      // Define known colors
      const colors = {
        '#ffffff': 'white',
        '#fff': 'white',
        /* ... */
        '#000000': 'black',
        '#000': 'black',
      };
      // Replace color value if it is a known color value
      event.value = colors[event.value.toLowerCase()] || event.value;
    };
  }
}
```
