import type {
  Linter,
  Formatter,
  TestFramework,
  UIFramework,
  LintCategory
} from '@43081j/configurator-core';
import {TagInput} from './TagInput.js';
import {Select} from './Select.js';
import {CheckboxGroup} from './CheckboxGroup.js';
import {RadioGroup} from './RadioGroup.js';
import * as store from '../store/config.js';

const LINTERS: Array<{value: Linter; label: string}> = [
  {value: 'eslint', label: 'ESLint'},
  {value: 'oxlint', label: 'oxlint'},
  {value: 'biome', label: 'Biome'}
];

const FORMATTERS: Array<{value: Formatter; label: string}> = [
  {value: 'prettier', label: 'Prettier'},
  {value: 'oxfmt', label: 'oxfmt'},
  {value: 'biome', label: 'Biome'}
];

const TEST_FRAMEWORKS: Array<{value: TestFramework; label: string}> = [
  {value: 'jest', label: 'Jest'},
  {value: 'mocha', label: 'Mocha'},
  {value: 'vitest', label: 'Vitest'}
];

const UI_FRAMEWORKS: Array<{value: UIFramework; label: string}> = [
  {value: 'react', label: 'React'},
  {value: 'vue', label: 'Vue'},
  {value: 'svelte', label: 'Svelte'},
  {value: 'lit', label: 'Lit'},
  {value: 'angular', label: 'Angular'}
];

const LINT_CATEGORIES: Array<{value: LintCategory; label: string}> = [
  {value: 'correctness', label: 'Correctness'},
  {value: 'performance', label: 'Performance'},
  {value: 'modernization', label: 'Modernization'}
];

export function Sidebar() {
  return (
    <aside class="w-96 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div class="px-6 py-6 border-b border-gray-200 bg-gray-50">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
          Configurator
        </h1>
        <p class="text-sm text-gray-600 mt-1">Configure your dev tools</p>
      </div>

      <div class="px-6 py-6 flex flex-col gap-6">
        <TagInput
          label="Source Globs"
          value={store.sources.value}
          onChange={(v) => (store.sources.value = v)}
          placeholder="src/**/*.ts"
        />

        <TagInput
          label="Test Globs"
          value={store.tests.value}
          onChange={(v) => (store.tests.value = v)}
          placeholder="test/**/*.test.ts"
        />

        <Select
          label="Linter"
          value={store.linter.value}
          onChange={(v) => (store.linter.value = v)}
          options={LINTERS}
          includeNone
        />

        {store.linter.value !== 'none' && (
          <CheckboxGroup
            label="Lint Categories"
            value={store.lintCategories.value}
            onChange={(v) => (store.lintCategories.value = v)}
            options={LINT_CATEGORIES}
          />
        )}

        <Select
          label="Formatter"
          value={store.formatter.value}
          onChange={(v) => (store.formatter.value = v)}
          options={FORMATTERS}
          includeNone
        />

        <Select
          label="Test Framework"
          value={store.testFramework.value}
          onChange={(v) => (store.testFramework.value = v)}
          options={TEST_FRAMEWORKS}
          includeNone
        />

        <Select
          label="UI Framework"
          value={store.uiFramework.value}
          onChange={(v) => (store.uiFramework.value = v)}
          options={UI_FRAMEWORKS}
          includeNone
        />

        <RadioGroup
          label="Use TypeScript?"
          value={store.typescript.value}
          onChange={(v) => (store.typescript.value = v)}
        />
      </div>
    </aside>
  );
}
