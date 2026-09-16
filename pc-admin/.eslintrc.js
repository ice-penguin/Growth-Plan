/*
 * @Author: jianxl
 * @LastEditors: jianxl
 * @symbol_custom_string_obkoro1: I love coding
 */
module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/strongly-recommended',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 允许使用 async-await
    'generator-star-spacing': 'off',
    'no-mixed-operators': 0,
    // 函数名括号前不需要有空格
    'space-before-function-paren': 'off',
    // 最多出现1个连续空行
    'no-multiple-empty-lines': [
      'error', 
      {
      'max': 1
      }
    ],
    'no-trailing-spaces': [
      'off',
      {
        "skipBlankLines": true, //允许在空行上结尾空白
        "ignoreComments": true // 允许注释块中的尾随空白
      }
    ],
    "comma-dangle": [
      2,
      "never"
    ],
    // html属性必须换行
    'vue/max-attributes-per-line': [
      2,
      {
        'singleline': 5,
        'multiline': {
          'max': 1,
          'allowFirstLine': false
        }
      }
    ],
    // 不允许使用eval
    "no-eval": 2,
    'vue/attribute-hyphenation': 0,
    // 没有内容的元素需要使用闭合标签
    'vue/html-self-closing': 0,
    'vue/component-name-in-template-casing': 0,
    'vue/html-closing-bracket-spacing': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/no-parsing-error': 0,
    'no-tabs': 0,
    // 禁止使用 var
    'no-var': 'error',
    'quotes': [
      2,
      'single',
      {
        'avoidEscape': true,
        'allowTemplateLiterals': true
      }
    ],
    'semi': [
      2,
      'never',
      {
        'beforeStatementContinuationChars': 'never'
      }
    ],
    'no-delete-var': 2,
    'prefer-const': [
      2,
      {
        'ignoreReadBeforeAssign': false
      }
    ],
    'template-curly-spacing': 'off',
    'indent': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
