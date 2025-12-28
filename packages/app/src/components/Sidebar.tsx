import {useState} from 'preact/hooks';
import {defaults} from '@43081j/configurator-core';
import {TagInput} from './TagInput.js';
import {Select} from './Select.js';
import {CheckboxGroup} from './CheckboxGroup.js';
import {RadioGroup} from './RadioGroup.js';

const LINTERS = [
  {value: 'eslint', label: 'ESLint'},
  {value: 'oxlint', label: 'oxlint'},
  {value: 'biome', label: 'Biome'}
];

const FORMATTERS = [
  {value: 'prettier', label: 'Prettier'},
  {value: 'oxfmt', label: 'oxfmt'},
  {value: 'biome', label: 'Biome'}
];

const TEST_FRAMEWORKS = [
  {value: 'jest', label: 'Jest'},
  {value: 'mocha', label: 'Mocha'},
  {value: 'vitest', label: 'Vitest'}
];

const UI_FRAMEWORKS = [
  {value: 'react', label: 'React'},
  {value: 'vue', label: 'Vue'},
  {value: 'svelte', label: 'Svelte'},
  {value: 'lit', label: 'Lit'},
  {value: 'angular', label: 'Angular'}
];

const LINT_CATEGORIES = [
  {value: 'correctness', label: 'Correctness'},
  {value: 'performance', label: 'Performance'},
  {value: 'modernization', label: 'Modernization'}
];

export function Sidebar() {
  const [sources, setSources] = useState(defaults.sources);
  const [tests, setTests] = useState(defaults.tests);
  const [linter, setLinter] = useState(defaults.linter ?? 'none');
  const [lintCategories, setLintCategories] = useState<string[]>(
    defaults.lintConfig?.categories ?? []
  );
  const [formatter, setFormatter] = useState(defaults.formatter ?? 'none');
  const [testFramework, setTestFramework] = useState(
    defaults.testFramework ?? 'none'
  );
  const [uiFramework, setUiFramework] = useState(
    defaults.uiFramework ?? 'none'
  );
  const [typescript, setTypescript] = useState(defaults.typescript);

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
          value={sources}
          onChange={setSources}
          placeholder="src/**/*.ts"
        />

        <TagInput
          label="Test Globs"
          value={tests}
          onChange={setTests}
          placeholder="test/**/*.test.ts"
        />

        <Select
          label="Linter"
          value={linter}
          onChange={setLinter}
          options={LINTERS}
          includeNone
        />

        {linter !== 'none' && (
          <CheckboxGroup
            label="Lint Categories"
            value={lintCategories}
            onChange={setLintCategories}
            options={LINT_CATEGORIES}
          />
        )}

        <Select
          label="Formatter"
          value={formatter}
          onChange={setFormatter}
          options={FORMATTERS}
          includeNone
        />

        <Select
          label="Test Framework"
          value={testFramework}
          onChange={setTestFramework}
          options={TEST_FRAMEWORKS}
          includeNone
        />

        <Select
          label="UI Framework"
          value={uiFramework}
          onChange={setUiFramework}
          options={UI_FRAMEWORKS}
          includeNone
        />

        <RadioGroup
          label="Use TypeScript?"
          value={typescript}
          onChange={setTypescript}
        />
      </div>
    </aside>
  );
}
