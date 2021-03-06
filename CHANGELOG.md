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
