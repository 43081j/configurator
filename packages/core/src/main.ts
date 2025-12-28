import {processor as oxlintProcessor} from './processors/oxlint.js';
import type {Context, Processor, Config} from './types.js';

export * from './types.js';

const processors = new Set<Processor>([oxlintProcessor]);

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
