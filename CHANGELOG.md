### Version 3.2.6

- Updated documentation to update property definitions syntax from `public prop = undefined as any` to `public prop?: any = undefined;`
- Updated tests to update property definitions syntax from `public prop = undefined as any` to `public prop?: any = undefined;`

### Version 3.2.5

- Fixed issue with cloning nested EnTT instances where properties marked with `serialize: false` or `deserialize: false` were not being cloned directly

### Version 3.2.4

- Further fix for issues with keeping track of nested EnTT instances when setting values of aliased properties by deserializing. This was causing validation errors and status not to propagate properly after deserializing a property configured with an alias.
- Fixed issues stemming from overriding the .errors and/or .valid getters on a EnTT model class

### Version 3.2.3

- Fixed issues with keeping track of nested EnTT instances when setting values by deserializing. This was causing validation errors and status not to propagate properly after deserializing.

### Version 3.2.2

- Now allowing alternative (factory pattern) declaration of `@Serializable({ cast })` argument, to help mitigate circular dependency problems when using nested models: `@Serializable({ cast: () => MyEnTTClass })`
- Updated typescript version to `4.2.4`
- Updated yup version to `0.32.9`
- `@Property` custom getter/setter callback's second argument is now optional: `(value: any, obj?: any) => any`
- `@Serializable` custom serialize/deserialize callback's second argument is now optional: `(value: any, obj?: any) => any`
- `@Validate` custom provider validation function's second argument is now optional: `(value: any, obj?: any) => Error[] | Error | string | boolean`

### Version 3.2.1

- Fix making sure EnTT.cast() type definition is correct when base type and 'into' argument types aren't the same
- Fix making .deserialize() return type definition pick up parent class being called from
- Fix making .clone() return type definition pick up parent class being called from
- Code-style cleanup of README code examples and unit tests

### Version 3.2.0

##### Breaking changes

- Arguments order changed in callbacks for:
  - `@Property` custom getter/setter callback functions changed from `(obj: any, value: any) => any` to `(value: any, obj: any) => any`
  - `@Serializable` custom serialize/deserialize callback functions changed from `(obj: any, value: any) => any` to `(value: any, obj: any) => any`
  - `@Validate` custom provider validation function changed from `(obj: any, value: any) => Error[] | Error | string | boolean` to `(value: any, obj: any) => Error[] | Error | string | boolean`

##### Non breaking changes

- All methods are now strongly typed

### Version 3.1.7

- `@Serializable` direct serialization/deserialization via "`serialize`"/"`deserialize`" now directly uses returned value as property value with no additional processing

### Version 3.1.5 / 3.1.6 (2020-07-15)

- No longer forcing validation during deserialization, due to performance issues - replaced with single validation run once deserialization complete
- `.deserialize()`, `.cast()` and `.clone()` methods now accept an additional, optional `validate` argument, allowing to circumvent validation of newly created instance

### Version 3.1.4 (2020-06-09)

- `@Property` now accepts a "`tag`" argument that can be searched via the static `.findTaggedProperties()` method
- Clone now ignores custom "`serialize`"/"`deserialize`" configuration
- Clone now supports an additional "`target`" argument

### Version 3.1.3 (2020-05-25)

`@Serializable` replaced "`serialize`" property with "`serialize`"/"`deserialize`" properties supporting custom mapping functions

### Version 3.0.2 (2020-05-11)

Added support for partially serializable properties via `Serializable.serialize` enum

### Version 3.0.1 (2020-04-20)

Updated README.md to be inline with the published npm package name: @ofzza/entt

### Version 3.0.0 (2020-04-20)

Initial release of new, TypeScript, implementation
