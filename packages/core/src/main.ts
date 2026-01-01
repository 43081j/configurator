import {processor as oxlintProcessor} from './processors/oxlint.js';
import {processor as prettierProcessor} from './processors/prettier.js';
import {processor as oxfmtProcessor} from './processors/oxfmt.js';
import {processor as editorConfigProcessor} from './processors/editorconfig.js';
import {processor as vitestProcessor} from './processors/vitest.js';
import {processor as mochaProcessor} from './processors/mocha.js';
import {processor as eslintProcessor} from './processors/eslint.js';
import {processor as biomeProcessor} from './processors/biome.js';
import {processor as zshyProcessor} from './processors/zshy.js';
import {processor as typescriptProcessor} from './processors/typescript.js';
import {processor as tsdownProcessor} from './processors/tsdown.js';
import type {Context, Processor, Config} from './types.js';
import {ConfigValidationError} from './types.js';
import {INCOMPATIBLE_BUNDLERS} from './constants.js';

export * from './types.js';
export * from './constants.js';

const processors = new Set<Processor>([
  oxlintProcessor,
  prettierProcessor,
  oxfmtProcessor,
  editorConfigProcessor,
  vitestProcessor,
  mochaProcessor,
  eslintProcessor,
  biomeProcessor,
  zshyProcessor,
  typescriptProcessor,
  tsdownProcessor
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

  if (config.bundler === 'zshy' && !config.typescript) {
    throw new ConfigValidationError(
      'Bundler "zshy" requires TypeScript to be enabled'
    );
  }

  if (config.bundler === 'typescript' && !config.typescript) {
    throw new ConfigValidationError(
      'Bundler "typescript" requires TypeScript to be enabled'
    );
  }

  if (config.uiFramework) {
    const incompatibleBundlers = INCOMPATIBLE_BUNDLERS[config.uiFramework];
    const selectedBundler = config.bundler ?? 'none';

    if (
      incompatibleBundlers.length > 0 &&
      incompatibleBundlers.includes(selectedBundler)
    ) {
      throw new ConfigValidationError(
        `UI framework "${config.uiFramework}" requires a bundler to be selected which is capable of handling ${config.uiFramework} files`
      );
    }
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
