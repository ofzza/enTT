// EnTT lib base functionality tests
// ----------------------------------------------------------------------------

// Import tests
import { testInternals } from './internals/index.spec';
import { testStaticClassDecorators } from './_spec/staticClassDecorator.spec';
import { testDynamicClassDecorators } from './_spec/dynamicClassDecorator.spec';
import { testStaticPropertyDecorators } from './_spec/staticPropertyDecorator.spec';
import { testDynamicPropertyDecorators } from './_spec/dynamicPropertyDecorator.spec';
import { testInheritabilityOfDecorators } from './_spec/inheritabilityOfDecorators.spec';

describe('Libraray core', () => {
  describe('Internals', () => {
    testInternals();
  });

  describe('Can implement a custom, static class decorator', () => {
    testStaticClassDecorators();
  });

  describe('Can implement a custom, dynamic class decorator', () => {
    testDynamicClassDecorators();
  });

  describe('Can implement a custom, static property decorator', () => {
    testStaticPropertyDecorators();
  });

  describe('Can implement a custom, dynamic property decorator', () => {
    testDynamicPropertyDecorators();
  });

  describe('Class and Property decorators can be inherited by inheriting classes', () => {
    testInheritabilityOfDecorators();
  });
});
