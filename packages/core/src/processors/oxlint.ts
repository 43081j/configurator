import type {
  Processor,
  OxlintConfig,
  LintCategory,
  OxlintRuleConfig
} from '../types.js';
import {configs as litConfigs} from 'eslint-plugin-lit';

const categoryMapping: Record<LintCategory, Record<string, string>> = {
  correctness: {
    correctness: 'error',
    suspicious: 'error'
  },
  performance: {
    perf: 'error'
  },
  modernization: {}
};

export const processor: Processor = async (context) => {
  if (context.config.linter !== 'oxlint') {
    return;
  }

  context.addDevDependency('oxlint', '^1.35.0');

  const plugins: string[] = ['eslint', 'oxc'];
  const env: Record<string, boolean> = {};
  const rules: Record<string, OxlintRuleConfig> = {};

  if (context.config.typescript) {
    plugins.push('typescript');
  }

  switch (context.config.uiFramework) {
    case 'react':
    case 'preact': {
      plugins.push('react');
      if (context.config.lintConfig?.categories.includes('performance')) {
        plugins.push('react-perf');
      }
      break;
    }
    case 'vue':
      plugins.push('vue');
      break;
    case 'svelte':
      // TODO (jg): this is probably wrong given the svelte plugin
      // needs a custom parser. afaik oxlint doesn't support that yet.
      plugins.push('eslint-plugin-svelte');
      context.addDevDependency('eslint-plugin-svelte', '^3.13.1');
      break;
    case 'lit':
      plugins.push('eslint-plugin-lit');
      context.addDevDependency('eslint-plugin-lit', '^2.1.1');
      for (const [ruleName, ruleConfig] of Object.entries(
        litConfigs['flat/recommended'].rules!
      )) {
        // Sketchy never cast to get from ESLint types to basic types
        rules[ruleName] = ruleConfig as never;
      }
      break;
    case 'angular':
      break;
  }

  switch (context.config.testFramework) {
    case 'jest':
      plugins.push('jest');
      break;
    case 'vitest':
      plugins.push('vitest');
      break;
    case 'mocha':
      env['mocha'] = true;
      break;
  }

  if (context.config.uiFramework) {
    env['browser'] = true;
  }

  const categories: Record<string, string> = {};

  if (context.config.lintConfig) {
    for (const category of context.config.lintConfig.categories) {
      const mapped = categoryMapping[category];
      for (const [key, value] of Object.entries(mapped)) {
        categories[key] = value;
      }
    }
  }

  const config: OxlintConfig = {
    plugins,
    env,
    rules,
    categories
  };

  await context.emitFile({
    name: '.oxlintrc.json',
    contents: config
  });
};
