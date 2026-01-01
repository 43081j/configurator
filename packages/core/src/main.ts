import {processor as oxlintProcessor} from './processors/oxlint.js';
import {processor as prettierProcessor} from './processors/prettier.js';
import {processor as oxfmtProcessor} from './processors/oxfmt.js';
import {processor as editorConfigProcessor} from './processors/editorconfig.js';
import {processor as vitestProcessor} from './processors/vitest.js';
import {processor as mochaProcessor} from './processors/mocha.js';
import {processor as eslintProcessor} from './processors/eslint.js';
import {processor as biomeProcessor} from './processors/biome.js';
import {processor as zshyProcessor} from './processors/zshy.js';
import type {Context, Processor, Config} from './types.js';
import {ConfigValidationError} from './types.js';

export * from './types.js';

const processors = new Set<Processor>([
  oxlintProcessor,
  prettierProcessor,
  oxfmtProcessor,
  editorConfigProcessor,
  vitestProcessor,
  mochaProcessor,
  eslintProcessor,
  biomeProcessor,
  zshyProcessor
]);

const bundlersRequiringEntryPoint = ['tsdown', 'zshy', 'rolldown', 'esbuild'];

function validateConfig(config: Config): void {
  if (
    config.bundler &&
    bundlersRequiringEntryPoint.includes(config.bundler) &&
    !config.mainEntryPoint.trim()
  ) {
    throw new ConfigValidationError(
      `Bundler "${config.bundler}" requires a main entry point to be specified`
    );
  }
}

export async function execute(context: Context): Promise<void> {
  validateConfig(context.config);

  for (const processor of processors) {
    await processor(context);
  }

  await context.finalise();
}

export const defaults: Config = {
  mainEntryPoint: 'src/main.ts',
  tests: ['src/**/*.test.ts'],
  sources: ['src/**/*.ts'],
  linter: 'eslint',
  formatter: 'prettier',
  lintConfig: {
    categories: ['correctness', 'performance', 'modernization']
  },
  typescript: true
};
