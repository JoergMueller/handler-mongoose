// expand jest config for ci
var jest = {
  roots: ['<rootDir>/tests/functional/'],

  // only text coverage
  coverageReporters: ['text-summary'],
  // no output
  coverageDirectory: '',

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
};

module.exports = {
  testEnvironment: 'node',
};

// export modified jest config
module.exports = Object.assign({}, require('./jest.json'), jest);
