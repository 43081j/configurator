import {
  LINTERS,
  FORMATTERS,
  TEST_FRAMEWORKS,
  UI_FRAMEWORKS,
  BUNDLERS,
  LINT_CATEGORIES,
  INCOMPATIBLE_BUNDLERS
} from '@43081j/configurator-core';
import {TagInput} from './TagInput.js';
import {TextInput} from './TextInput.js';
import {Select} from './Select.js';
import {CheckboxGroup} from './CheckboxGroup.js';
import {RadioGroup} from './RadioGroup.js';
import * as store from '../store/config.js';
import {sidebarOpen} from '../store/ui.js';

export function Sidebar() {
  const selectedUIFramework = store.uiFramework.value;
  const incompatibleBundlers =
    selectedUIFramework && selectedUIFramework !== 'none'
      ? INCOMPATIBLE_BUNDLERS[selectedUIFramework]
      : [];

  const bundlerOptions = BUNDLERS.map((bundler) => ({
    ...bundler,
    disabled: incompatibleBundlers.includes(bundler.value)
  }));

  return (
    <>
      <div
        class={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${
          sidebarOpen.value ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => (sidebarOpen.value = false)}
      ></div>

      <aside
        class={`fixed inset-y-0 left-0 z-40 w-full max-w-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-96 h-screen bg-white border-r border-gray-200 flex flex-col ${
          sidebarOpen.value
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div class="px-6 py-6 border-b border-gray-200 bg-gray-50 relative">
          <button
            onClick={() => (sidebarOpen.value = false)}
            class="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <div class="i-material-symbols-close text-xl text-gray-700"></div>
          </button>

          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            <a href="https://github.com/43081j" class="shine-link">
              @43081j
            </a>
            's Configurator
          </h1>
          <p class="text-sm text-gray-600 mt-1">Configure your dev tools</p>

          <a
            href="https://github.com/43081j/configurator"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-full transition-colors"
          >
            <div class="i-material-symbols-open-in-new text-lg"></div>
            View on GitHub
          </a>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          <TextInput
            label="Main Entry Point"
            value={store.mainEntryPoint.value}
            onChange={(v) => (store.mainEntryPoint.value = v)}
            placeholder="src/main.ts"
          />

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

          <Select
            label="Bundler"
            value={store.bundler.value}
            onChange={(v) => (store.bundler.value = v)}
            options={bundlerOptions}
            includeNone
          />

          <RadioGroup
            label="Use TypeScript?"
            value={store.typescript.value}
            onChange={(v) => (store.typescript.value = v)}
          />
        </div>
      </aside>
    </>
  );
}
