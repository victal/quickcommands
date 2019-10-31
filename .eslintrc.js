module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    webextensions: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
  }
}
