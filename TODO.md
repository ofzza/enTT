# Change detection

- [ ] Track changes for all EnTT-ified instances:
  - [ ] Track last constructed instance for each class
  - [ ] Track last property set
  - [ ] Track last property change
  - [ ] Track last property read
- [ ] Provide a service for tracking if changes since last checked

# Property decorators

## @Def base decorator

- [ ] Implement and enforce usage (to the extent possible) of `@def` decorator on all properties

## @Hydration decorators

- [ ] Bind properties for (re)hydrate/dehydrate calls
- [ ] Cast property values on (re)hydrate call as single/array/hashmap of:
  - [ ] Entities
  - [ ] Other classes (ex: Date, Map, Set, ...)
- [ ] Consider handling circular references

## @Validation decorator

- [ ] Define valudation expressions using:
  - [ ] Direct function
  - [ ] Joi (lite)
  - [ ] Yup
- [ ] Validate property values for errors