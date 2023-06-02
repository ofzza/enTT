// EnTT lib base functionality tests
// ----------------------------------------------------------------------------

// Import tests
import { testInternals } from './internals/index.spec';
import { testStaticClassDecorators } from './_spec/staticClassDecorator.spec';
import { testDynamicClassDecorators } from './_spec/dynamicClassDecorator.spec';
import { testStaticPropertyDecorators } from './_spec/staticPropertyDecorator.spec';
import { testDynamicPropertyDecorators } from './_spec/dynamicPropertyDecorator.spec';
import { testInheritabilityOfDecorators } from './_spec/inheritabilityOfDecorators.spec';

// Test ...
describe('Libraray core', () => {
  // Tests internals
  describe('Internals', () => {
    testInternals();
  });

  // Tests static custom class decorators cration and implementation
  describe('Can implement a custom, static class decorator', () => {
    testStaticClassDecorators();
  });

  // Tests dynamic custom class decorators cration and implementation
  describe('Can implement a custom, dynamic class decorator', () => {
    testDynamicClassDecorators();
  });

  // Tests static custom property decorators cration and implementation
  describe('Can implement a custom, static property decorator', () => {
    testStaticPropertyDecorators();
  });

  // Tests dynamic custom property decorators cration and implementation
  describe('Can implement a custom, dynamic property decorator', () => {
    testDynamicPropertyDecorators();
  });

  // Tests inheritability of class and property decorators
  describe('Class and Property decorators can be inherited by inheriting classes', () => {
    testInheritabilityOfDecorators();
  });
});
