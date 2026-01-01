import type {
  Linter,
  Formatter,
  TestFramework,
  UIFramework,
  Bundler,
  LintCategory
} from './types.js';

export interface LabeledOption<T extends string = string> {
  value: T;
  label: string;
}

export const LINTERS: Array<LabeledOption<Linter>> = [
  {value: 'eslint', label: 'ESLint'},
  {value: 'oxlint', label: 'oxlint'},
  {value: 'biome', label: 'Biome'}
];

export const FORMATTERS: Array<LabeledOption<Formatter>> = [
  {value: 'prettier', label: 'Prettier'},
  {value: 'oxfmt', label: 'oxfmt'},
  {value: 'biome', label: 'Biome'}
];

export const TEST_FRAMEWORKS: Array<LabeledOption<TestFramework>> = [
  {value: 'jest', label: 'Jest'},
  {value: 'mocha', label: 'Mocha'},
  {value: 'vitest', label: 'Vitest'}
];

export const UI_FRAMEWORKS: Array<LabeledOption<UIFramework>> = [
  {value: 'react', label: 'React'},
  {value: 'vue', label: 'Vue'},
  {value: 'svelte', label: 'Svelte'},
  {value: 'lit', label: 'Lit'},
  {value: 'angular', label: 'Angular'},
  {value: 'preact', label: 'Preact'}
];

export const BUNDLERS: Array<LabeledOption<Bundler>> = [
  {value: 'tsdown', label: 'tsdown'},
  {value: 'zshy', label: 'zshy'},
  {value: 'typescript', label: 'TypeScript'},
  {value: 'rolldown', label: 'Rolldown'},
  {value: 'esbuild', label: 'esbuild'}
];

export const LINT_CATEGORIES: Array<LabeledOption<LintCategory>> = [
  {value: 'correctness', label: 'Correctness'},
  {value: 'performance', label: 'Performance'},
  {value: 'modernization', label: 'Modernization'}
];

export const INCOMPATIBLE_BUNDLERS: Record<
  UIFramework,
  Array<Bundler | 'none'>
> = {
  vue: ['typescript', 'zshy', 'none'],
  svelte: ['typescript', 'zshy', 'none'],
  react: [],
  preact: [],
  lit: [],
  angular: []
};
