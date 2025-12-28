import {signal, computed} from '@preact/signals';
import {defaults} from '@43081j/configurator-core';
import type {
  Config,
  Linter,
  Formatter,
  TestFramework,
  UIFramework,
  LintCategory
} from '@43081j/configurator-core';

export const sources = signal<string[]>(defaults.sources);
export const tests = signal<string[]>(defaults.tests);
export const linter = signal<Linter | 'none'>(defaults.linter ?? 'none');
export const lintCategories = signal<LintCategory[]>(
  defaults.lintConfig?.categories ?? []
);
export const formatter = signal<Formatter | 'none'>(
  defaults.formatter ?? 'none'
);
export const testFramework = signal<TestFramework | 'none'>(
  defaults.testFramework ?? 'none'
);
export const uiFramework = signal<UIFramework | 'none'>(
  defaults.uiFramework ?? 'none'
);
export const typescript = signal<boolean>(defaults.typescript);

export const config = computed<Config>(() => {
  const cfg: Config = {
    sources: sources.value,
    tests: tests.value,
    typescript: typescript.value
  };

  if (linter.value !== 'none') {
    cfg.linter = linter.value;
  }

  if (formatter.value !== 'none') {
    cfg.formatter = formatter.value;
  }

  if (testFramework.value !== 'none') {
    cfg.testFramework = testFramework.value;
  }

  if (uiFramework.value !== 'none') {
    cfg.uiFramework = uiFramework.value;
  }

  if (lintCategories.value.length > 0) {
    cfg.lintConfig = {categories: lintCategories.value};
  }

  return cfg;
});
