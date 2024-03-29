require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [require.resolve('./js'), require.resolve('./ts'), 'plugin:prettier/recommended'],
  ignorePatterns: ['dist/**/*.js', 'dist/**/*.d.ts', 'node_modules/**/*', '**/*.md'],
  rules: {
    'no-redeclare': 'off',
    'no-unused-vars': 'off',
    'no-useless-constructor': 'off',
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    'no-throw-literal': 'off',
    'no-unused-expressions': 'off',
    'no-return-assign': 'off',
    'no-warning-comments': 'off',
    'no-await-in-loop': 'off',
    'func-names': 'off',
    'default-param-last': 'off',
    'array-callback-return': 'off',
    'import/no-named-default': 'off',
    'no-void': 'off',
    'no-sequences': 'off',
    'no-loop-func': 'off',
    'no-else-return': 'off',

    'import/no-dynamic-require': 'off',
    'import/no-unassigned-import': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-duplicates': 'off',

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',

    'prettier/prettier': 'error',
    'no-sparse-arrays': 'off',
    indent: 'off',
    'brace-style': 'off',
    'no-debugger': 'off',
  },
};
