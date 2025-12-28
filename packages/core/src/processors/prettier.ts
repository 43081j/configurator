import type {Processor, PrettierConfig} from '../types.js';

const defaultPrettierConfig: PrettierConfig = {
  bracketSpacing: false,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
  arrowParens: 'always'
};

export const processor: Processor = async (context) => {
  if (context.config.formatter !== 'prettier') {
    return;
  }

  const config: PrettierConfig = {
    ...defaultPrettierConfig
  };

  switch (context.config.uiFramework) {
    case 'svelte': {
      config.plugins ??= [];
      config.plugins.push('prettier-plugin-svelte');
      config.overrides ??= [];
      config.overrides.push({
        files: '*.svelte',
        options: {parser: 'svelte'}
      });
      break;
    }
  }

  await context.emitFile({
    name: '.prettierrc.json',
    contents: config
  });
};
