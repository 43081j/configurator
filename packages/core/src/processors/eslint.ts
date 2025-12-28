import type {Processor, LintCategory, Context} from '../types.js';

const createESLintConfig = (context: Context): string => {
  const imports: string[] = [
    `import {defineConfig} from 'eslint/config';`,
    `import js from '@eslint/js';`
  ];
  const sources = JSON.stringify(context.config.sources);
  const tests = JSON.stringify(context.config.tests);
  const sourcesAndTests = JSON.stringify([
    ...context.config.sources,
    ...context.config.tests
  ]);
  const extendsList: string[] = ['plugin:js/recommended'];
  const plugins: Array<[string, string]> = [['js', '']];
  const globals: string[] = [];
  if (context.config.typescript) {
    imports.push(`import ts from 'typescript-eslint';`);
    extendsList.push('ts/flat/strict');
    plugins.push(['ts', '']);
  }
  switch (context.config.uiFramework) {
    case 'react': {
      context.addDependency('@eslint-react/eslint-plugin', '^2.4.0');
      imports.push(`import eslintReact from '@eslint-react/eslint-plugin';`);
      if (context.config.typescript) {
        extendsList.push('@eslint-react/recommended-typescript');
      } else {
        extendsList.push('@eslint-react/recommended');
      }
      plugins.push(['@eslint-react', 'eslintReact']);
      break;
    }
    case 'vue':
      context.addDependency('eslint-plugin-vue', '^10.6.2');
      imports.push(`import vue from 'eslint-plugin-vue';`);
      extendsList.push('vue/flat/recommended');
      plugins.push(['vue', '']);
      break;
    case 'svelte':
      context.addDevDependency('eslint-plugin-svelte', '^3.13.1');
      imports.push(`import svelte from 'eslint-plugin-svelte';`);
      imports.push(`import svelteConfig from './svelte.config.js';`);
      extendsList.push('svelte/recommended');
      plugins.push(['svelte', '']);
      break;
    case 'lit':
      context.addDevDependency('eslint-plugin-lit', '^2.1.1');
      imports.push(`import lit from 'eslint-plugin-lit';`);
      extendsList.push('lit/flat/recommended');
      break;
    case 'angular':
      break;
  }

  switch (context.config.testFramework) {
    case 'jest':
      // TODO (jg): maybe a jest lint plugin?
      break;
    case 'vitest':
      // TODO (jg): maybe a vitest lint plugin?
      break;
    case 'mocha':
      globals.push('...globals.mocha');
      break;
  }

  if (context.config.uiFramework) {
    globals.push('...globals.browser');
  }

  const categories: Record<string, string> = {};

  if (context.config.lintConfig) {
    const categories = context.config.lintConfig.categories;

    if (
      categories.includes('modernization') ||
      categories.includes('performance')
    ) {
      context.addDevDependency('@e18e/eslint-plugin', '^0.1.3');
      imports.push(`import e18e from '@e18e/eslint-plugin';`);
      extendsList.push('e18e/recommended');
      plugins.push(['e18e', '']);
    }

    // TODO (jg): add more category based plugins/rules here
  }
  const pluginsString = plugins
    .map(([name, symbol]) => (symbol ? `${name}: ${symbol}` : name))
    .join(',\n      ');
  const globalsString = globals.join(',\n        ');
  if (globals.length > 0) {
    imports.push(`import globals from 'globals';`);
  }
  return `
${imports.join('\n')}

export default defineConfig([
	{
		files: ${sourcesAndTests},
    languageOptions: {
      globals: {
        ${globalsString}
      }
    },
		plugins: {
      ${pluginsString}
    },
		extends: ${JSON.stringify(extendsList, null, 2)}
  }${
    context.config.uiFramework === 'svelte'
      ? `,
  {
    files: ['**/*.svelte', '**/*.svelte.${context.config.typescript ? 'ts' : 'js'}'],
    languageOptions: {
      parserOptions: {
        svelteConfig
      }
    }
  }`
      : ''
  }
];
  `.trim();
};
export const processor: Processor = async (context) => {
  if (context.config.linter !== 'eslint') {
    return;
  }

  context.addDevDependency('eslint', '^9.39.2');

  const config = createESLintConfig(context);

  await context.emitFile({
    name: 'eslint.config.mjs',
    contents: config
  });
};
