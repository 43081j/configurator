import type {Processor, OxfmtConfig} from '../types.js';

const defaultOxfmtConfig: OxfmtConfig = {
  arrowParentheses: 'always',
  lineWidth: 120,
  quoteStyle: 'single',
  semi: true,
  trailingCommas: 'none'
};

export const processor: Processor = async (context) => {
  if (context.config.formatter !== 'oxfmt') {
    return;
  }

  context.addDevDependency('oxfmt', '^0.20.0');

  const config: OxfmtConfig = {
    ...defaultOxfmtConfig
  };

  await context.emitFile({
    name: '.oxfmtrc.jsonc',
    contents: config
  });
};
