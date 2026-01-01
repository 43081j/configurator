import type {Processor, BiomeConfig, LintCategory} from '../types.js';

const categoryMapping: Record<
  LintCategory,
  Record<string, string | {recommended: boolean}>
> = {
  correctness: {
    correctness: 'error',
    suspicious: 'error',
    security: 'error'
  },
  performance: {
    performance: 'error'
  },
  modernization: {}
};

export const processor: Processor = async (context) => {
  const isBiomeLinter = context.config.linter === 'biome';
  const isBiomeFormatter = context.config.formatter === 'biome';

  if (!isBiomeLinter && !isBiomeFormatter) {
    return;
  }

  context.addDevDependency('@biomejs/biome', '^2.3.10');

  let linter: BiomeConfig['linter'] = undefined;
  const files: BiomeConfig['files'] = {
    includes: [...context.config.sources, ...context.config.tests]
  };
  let formatter: BiomeConfig['formatter'] = undefined;
  let javascript: BiomeConfig['javascript'] = undefined;

  if (isBiomeFormatter) {
    formatter = {
      enabled: true,
      useEditorconfig: true,
      bracketSpacing: false
    };
    javascript = {
      formatter: {
        semicolons: 'always',
        quoteStyle: 'single',
        trailingCommas: 'none',
        arrowParentheses: 'always'
      }
    };
  }

  if (isBiomeLinter) {
    const categories = context.config.lintConfig?.categories || [];
    const rules: Record<string, string | {recommended: boolean}> = {};
    const domains: Record<string, string> = {};

    for (const category of categories) {
      const mapping = categoryMapping[category];
      for (const [ruleName, ruleConfig] of Object.entries(mapping)) {
        rules[ruleName] = ruleConfig;
      }
    }

    switch (context.config.uiFramework) {
      case 'react':
      case 'preact':
        domains['react'] = 'recommended';
        break;
      case 'vue':
        domains['vue'] = 'recommended';
        break;
    }

    linter = {
      enabled: true,
      domains,
      rules
    };
  }

  const config: BiomeConfig = {
    files,
    formatter,
    linter,
    javascript
  };

  await context.emitFile({
    name: 'biome.jsonc',
    contents: config
  });
};
