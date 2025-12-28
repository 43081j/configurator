import type {Processor} from '../types.js';

const defaultEditorConfig = `
root = true

[*]
end_of_line = lf
indent_size = 2
indent_style = space
trim_trailing_whitespace = true
insert_final_newline = true
`.trim();

export const processor: Processor = async (context) => {
  if (context.config.formatter === undefined) {
    return;
  }

  await context.emitFile({
    name: '.editorconfig',
    contents: defaultEditorConfig
  });
};
