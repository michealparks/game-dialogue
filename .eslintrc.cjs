module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: [
    '@typescript-eslint',
    'unicorn',
    'import', 
    'jsx-a11y',
    'sonarjs',
    'prefer-arrow',
    'svelte3'
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:unicorn/recommended',
    'plugin:sonarjs/recommended',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    project: ['./tsconfig.json'],
    extraFileExtensions: ['.svelte'],
  },
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            importNames: ['default'],
            message: 'Import specific named functions, like `import { map } from "lodash"`',
            name: 'lodash',
          },
        ],
      },
    ],
    'prefer-template': 'error',
    'quote-props': ['error', 'as-needed'],
    'no-undef': 'off', // Handled by TS
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'eol-last': 'error',
    'one-var': [
      'error',
      {
        let: 'never',
        const: 'never',
      },
    ],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'never'],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'never',
        functions: 'never',
      },
    ],
    eqeqeq: ['error', 'always', { null: 'always' }],
    'no-unreachable-loop': 'error',
    'no-unsafe-optional-chaining': 'error',
    'require-atomic-updates': 'error',
    'array-callback-return': 'error',
    'no-caller': 'error',
    'no-multi-spaces': 'error',
    'no-param-reassign': 'error',
    'no-return-await': 'error',
    radix: 'error',
    'require-await': 'error',
    strict: 'error',
    yoda: 'error',
    'no-var': 'error',
    'object-shorthand': ['error', 'properties'],
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',

    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],

    // Import
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/no-absolute-path': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'error',
    'import/export': 'error',
    'import/extensions': ['error', 'never'],
    'import/first': 'error',

    // Unicorn
    'unicorn/no-unsafe-regex': 'error',
    'unicorn/no-unused-properties': 'error',
    'unicorn/custom-error-definition': 'error',
    'unicorn/import-index': 'error',
    'unicorn/import-style': 'error',
    // @todo : re-enable prefer-at when support exists https://caniuse.com/mdn-javascript_builtins_array_at
    'unicorn/prefer-at': 'off',
    'unicorn/prefer-object-has-own': 'error',
    'unicorn/prefer-string-replace-all': 'error',
    'unicorn/string-content': 'error',

    'unicorn/prevent-abbreviations': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-null': 'off',
    'unicorn/consistent-destructuring': 'off',

    // Typescript
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'error',

    // Sonar
    'sonarjs/no-duplicate-string': 'off',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.ts?(x)',
        '**/tests/unit/**/*.spec.ts?(x)',
      ],
      plugins: [
        'testing-library',
        'jest-dom',
      ],
      extends: [
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
      ],
      rules: {
        'testing-library/await-async-query': 'off',
        'testing-library/prefer-screen-queries': 'off',
        'unicorn/numeric-separators-style': 'off',
      },
      env: {
        jest: true,
      },
    },
  ],
  settings: {
    // pass the TypeScript package to the Svelte plugin
    'svelte3/typescript': () => require('typescript'),
  },
}
