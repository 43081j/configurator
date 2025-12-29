import type {Processor, Context} from '../types.js';

const stringifyIndented = (obj: unknown, indent: number): string => {
  return JSON.stringify(obj, null, 2).replaceAll(
    /(?<=\n)/g,
    ' '.repeat(indent)
  );
};

const createAngularConfig = (): string => {
  return `
  {
    files: ['**/*.html'],
    extends: ['angular/templateRecommended']
  }`;
};

const createTestConfig = (context: Context, testGlobals: string[]): string => {
  return `
  {
    files: ${JSON.stringify(context.config.tests)},
    languageOptions: {
      globals: {
        ${testGlobals.join(',\n        ')}
      }
    }
  }`;
};

const createSvelteConfig = (context: Context): string => {
  return `
  {
    files: ['**/*.svelte', '**/*.svelte.${context.config.typescript ? 'ts' : 'js'}'],
    languageOptions: {
      parserOptions: {
        svelteConfig${
          context.config.typescript
            ? `,
        projectService: true,
        extraFileExtensions: ['svelte'],
        parser: ts.parser`
            : ''
        }
      }
    }
  }`;
};

const createESLintConfig = (context: Context): string => {
  const imports: string[] = [
    `import {defineConfig} from 'eslint/config';`,
    `import js from '@eslint/js';`
  ];
  const sourcesAndTests = JSON.stringify([
    ...context.config.sources,
    ...context.config.tests
  ]).replaceAll(/,/g, ', ');
  const extendsList: string[] = ['js/recommended'];
  const plugins: Array<[string, string]> = [['js', '']];
  const globals: string[] = [];
  const testGlobals: string[] = [];
  const uiFramework = context.config.uiFramework;
  const extraConfigs: string[] = [];
  if (context.config.typescript) {
    imports.push(`import ts from 'typescript-eslint';`);
    extendsList.push('ts/flat/strict');
    plugins.push(['ts', '']);
    context.addDevDependency('typescript-eslint', '^8.51.0');
  }
  switch (uiFramework) {
    case 'react': {
      context.addDevDependency('@eslint-react/eslint-plugin', '^2.4.0');
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
      context.addDevDependency('eslint-plugin-vue', '^10.6.2');
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
      extraConfigs.push(createSvelteConfig(context));
      break;
    case 'lit':
      context.addDevDependency('eslint-plugin-lit', '^2.1.1');
      imports.push(`import lit from 'eslint-plugin-lit';`);
      extendsList.push('lit/flat/recommended');
      break;
    case 'angular':
      context.addDevDependency('angular-eslint', '^21.1.0');
      imports.push(`import angular from 'angular-eslint';`);
      extendsList.push('angular/tsRecommended');
      plugins.push(['angular', '']);
      extraConfigs.push(createAngularConfig());
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
      testGlobals.push('...globals.mocha');
      break;
  }

  if (uiFramework) {
    globals.push('...globals.browser');
  }

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
  if (testGlobals.length > 0) {
    extraConfigs.push(createTestConfig(context, testGlobals));
  }
  const pluginsString = plugins
    .map(([name, symbol]) =>
      symbol ? `${JSON.stringify(name)}: ${symbol}` : name
    )
    .join(',\n      ');
  const globalsString = globals.join(',\n        ');
  if (globals.length > 0) {
    imports.push(`import globals from 'globals';`);
  }
  const extraConfigsString =
    extraConfigs.length > 0 ? `,${extraConfigs.join(',')}` : '';
  return `
${imports.join('\n')}

export default defineConfig([
  {
    files: ${sourcesAndTests},
    languageOptions: {${
      globals.length === 0
        ? ''
        : `
      globals: {
        ${globalsString}
      }`
    }
    },
    plugins: {
      ${pluginsString}
    },
    extends: ${stringifyIndented(extendsList, 4)}
  }${extraConfigsString}
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
