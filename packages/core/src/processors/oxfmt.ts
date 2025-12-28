import type {Processor, OxfmtConfig} from '../types.js';

const defaultOxfmtConfig: OxfmtConfig = {
  arrow_parentheses: 'always',
  indent_style: 'space',
  indent_width: 2,
  line_width: 120,
  quote_style: 'single',
  semi: true,
  trailing_commas: 'none'
};

export const processor: Processor = async (context) => {
  if (context.config.formatter !== 'oxfmt') {
    return;
  }

  const config: OxfmtConfig = {
    ...defaultOxfmtConfig
  };

  await context.emitFile({
    name: '.oxfmt.json',
    contents: config
  });
};
