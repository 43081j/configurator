import {processor as oxlintProcessor} from './processors/oxlint.js';
import {processor as prettierProcessor} from './processors/prettier.js';
import {processor as oxfmtProcessor} from './processors/oxfmt.js';
import {processor as editorConfigProcessor} from './processors/editorconfig.js';
import {processor as vitestProcessor} from './processors/vitest.js';
import {processor as mochaProcessor} from './processors/mocha.js';
import type {Context, Processor, Config} from './types.js';

export * from './types.js';

const processors = new Set<Processor>([
  oxlintProcessor,
  prettierProcessor,
  oxfmtProcessor,
  editorConfigProcessor,
  vitestProcessor,
  mochaProcessor
]);

export async function execute(context: Context): Promise<void> {
  for (const processor of processors) {
    await processor(context);
  }
}

export const defaults: Config = {
  tests: ['src/**/*.test.ts'],
  sources: ['src/**/*.ts'],
  linter: 'eslint',
  formatter: 'prettier',
  lintConfig: {
    categories: ['correctness', 'performance', 'modernization']
  },
  typescript: true
};
