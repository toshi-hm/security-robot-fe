export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue'],
  plugins: ['stylelint-order'],
  rules: {
    'order/properties-alphabetical-order': true,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'layer'],
      },
    ],
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,
    'scss/dollar-variable-pattern': null,
    'scss/at-mixin-pattern': null,
    'scss/at-function-pattern': null,
    'scss/percent-placeholder-pattern': null,
    'color-function-notation': 'modern',
    'alpha-value-notation': 'number',
    'color-hex-length': 'short',
    'declaration-block-no-redundant-longhand-properties': true,
    'shorthand-property-no-redundant-values': true,
    'declaration-block-no-duplicate-properties': true,
    'no-duplicate-selectors': true,
    'font-family-no-duplicate-names': true,
    'block-no-empty': true,
    'comment-no-empty': true,
    'no-empty-source': [
      true,
      {
        severity: 'warning',
      },
    ],
    'max-nesting-depth': [
      4,
      {
        ignore: ['pseudo-classes'],
      },
    ],
    'selector-max-id': 0,
    'selector-max-universal': 1,
    'selector-max-type': [
      2,
      {
        ignore: ['child', 'compounded'],
      },
    ],
  },
}
