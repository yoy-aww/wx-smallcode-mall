/**
 * Simple test runner for OrderSection component
 * Run with: node test-runner-simple.js
 */

// Simple test framework
let testCount = 0;
let passCount = 0;
let failCount = 0;

let beforeEachFn = null;

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
}

function beforeEach(fn) {
  beforeEachFn = fn;
}

function test(name, fn) {
  testCount++;
  try {
    if (beforeEachFn) {
      beforeEachFn();
    }
    fn();
    passCount++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failCount++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toHaveLength: (expected) => {
      if (!actual || actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeUndefined: () => {
      if (actual !== undefined) {
        throw new Error('Expected value to be undefined');
      }
    },
    not: {
      toThrow: () => {
        // For functions that should not throw
        try {
          if (typeof actual === 'function') {
            actual();
          }
        } catch (error) {
          throw new Error(`Expected function not to throw, but it threw: ${error.message}`);
        }
      }
    }
  };
}

const jest = {
  spyOn: (obj, method) => {
    const original = obj[method];
    let callCount = 0;
    obj[method] = function(...args) {
      callCount++;
      return original.apply(this, args);
    };
    return {
      toHaveBeenCalled: () => callCount > 0
    };
  }
};

// Mock global functions
global.Component = (options) => {
  return {
    ...options,
    data: options.data || {},
    properties: options.properties || {},
    setData: function(data) {
      Object.assign(this.data, data);
    },
    triggerEvent: function(name, detail, options) {
      this._events = this._events || {};
      this._events[name] = { detail, options };
    }
  };
};

// Make test functions global
global.describe = describe;
global.beforeEach = beforeEach;
global.test = test;
global.expect = expect;
global.jest = jest;

// Run the tests
console.log('🧪 Running OrderSection Component Tests...\n');

// Load and run the test file
require('./order-section.test.js');

// Print summary
console.log('\n📊 Test Summary:');
console.log(`   Total: ${testCount}`);
console.log(`   ✅ Passed: ${passCount}`);
console.log(`   ❌ Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n💥 Some tests failed!');
  process.exit(1);
}