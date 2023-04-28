# Testing

- [x] Import `@ofzza/ts-std` as dependency and use `assert`/`refute` as implemented there
- [ ] JSDocs for generics (@template)
- [ ] Write type inference tests using `assert`/`refute`

# Change detection

- [ ] Track changes for all EnTTified instances:
  - [ ] Track last constructed instance for each class
  - [ ] Track last property set
  - [ ] Track last property change
  - [ ] Track last property read
- [ ] Provide a service for tracking if changes since last checked

# Custom Class decorators

- [x] Add support for custom class decorators
  - [x] Static class decorators
  - [x] Dynamic class decorators

# Implement core decorators

## @Def core property decorator

- [x] Implement and enforce usage (to the extent possible) of `@def` decorator on all properties

## @Hydration core decorators and companion services

- [x] Bind properties for (re)hydrate/dehydrate calls
- [x] Cast property values on (re)hydrate call as single/array/hashmap of:
  - [x] Entities
  - [x] Other classes (ex: Date, Map, Set, ...)
- [ ] Consider handling circular references
- [ ] Consider handling shared references

## @Validation core decorators and companion services

- [ ] Define valudation expressions using:
  - [ ] Direct function
  - [ ] Joi (lite)
  - [ ] Yup
- [ ] Validate property values for errors
