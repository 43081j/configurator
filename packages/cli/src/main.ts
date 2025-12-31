import * as prompts from '@clack/prompts';
import sade from 'sade';
import {writeFile, mkdir, access} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {styleText} from 'node:util';
import {
  execute,
  ConfigValidationError,
  type Config,
  type Context,
  type FileInfo,
  type Linter,
  type Formatter,
  type TestFramework,
  type UIFramework,
  type Bundler,
  type LintCategory,
  defaults
} from '@43081j/configurator-core';

const LINTERS: Record<Linter, string> = {
  eslint: 'ESLint',
  oxlint: 'oxlint',
  biome: 'Biome'
};

const FORMATTERS: Record<Formatter, string> = {
  prettier: 'Prettier',
  oxfmt: 'oxfmt',
  biome: 'Biome'
};

const TEST_FRAMEWORKS: Record<TestFramework, string> = {
  jest: 'Jest',
  mocha: 'Mocha',
  vitest: 'Vitest'
};

const UI_FRAMEWORKS: Record<UIFramework, string> = {
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
  lit: 'Lit',
  angular: 'Angular'
};

const BUNDLERS: Record<Bundler, string> = {
  tsdown: 'tsdown',
  zshy: 'zshy',
  typescript: 'TypeScript',
  rolldown: 'Rolldown',
  esbuild: 'esbuild'
};

const LINT_CATEGORIES: Record<LintCategory, string> = {
  correctness: 'Correctness',
  performance: 'Performance',
  modernization: 'Modernization'
};

interface Options {
  'main-entry-point'?: string;
  sources?: string;
  tests?: string;
  linter?: string;
  formatter?: string;
  'test-framework'?: string;
  'ui-framework'?: string;
  bundler?: string;
  'lint-categories'?: string;
  typescript?: boolean;
  interactive?: boolean;
}

function isValidOption<T extends string>(
  value: string,
  options: Record<T, string>
): value is T {
  return value in options;
}

type OptionLike<T> = {value: T | undefined; label: string};

function toSelectOptions<T extends string>(
  options: Record<T, string>,
  includeNone = false
): Array<OptionLike<T>> {
  const opts = Object.entries<string>(options).map<OptionLike<T>>(
    ([value, label]) => ({
      value: value as T,
      label: label
    })
  );

  if (includeNone) {
    opts.unshift({value: undefined, label: 'None'});
  }

  return opts;
}

class ConfiguratorContext implements Context {
  public config: Config;
  #outDir: string;
  #devDependencies: Record<string, string> = {};
  #dependencies: Record<string, string> = {};

  constructor(config: Config, outDir: string) {
    this.config = config;
    this.#outDir = outDir;
  }

  async emitFile(file: FileInfo): Promise<void> {
    const filePath = join(this.#outDir, file.name);
    await mkdir(dirname(filePath), {recursive: true});
    const contents =
      typeof file.contents === 'string'
        ? file.contents
        : JSON.stringify(file.contents, null, 2);
    await writeFile(filePath, contents, 'utf-8');
  }

  addDevDependency(packageName: string, version: string): void {
    this.#devDependencies[packageName] = version;
  }

  addDependency(packageName: string, version: string): void {
    this.#dependencies[packageName] = version;
  }
}

async function handler(outDir: string, opts: Options): Promise<void> {
  prompts.intro('Configurator');

  if (!outDir) {
    prompts.log.error('Output directory is required');
    return;
  }

  try {
    await access(outDir);
  } catch {
    prompts.log.error(`Output directory does not exist: ${outDir}`);
    return;
  }

  let mainEntryPoint = opts['main-entry-point'] || defaults.mainEntryPoint;
  let sourcesString = opts.sources;
  let testsString = opts.tests;
  let linter: string | undefined =
    opts.linter === 'none' ? undefined : opts.linter;
  let formatter: string | undefined =
    opts.formatter === 'none' ? undefined : opts.formatter;
  let testFramework: string | undefined =
    opts['test-framework'] === 'none' ? undefined : opts['test-framework'];
  let uiFramework: string | undefined =
    opts['ui-framework'] === 'none' ? undefined : opts['ui-framework'];
  let bundler: string | undefined =
    opts.bundler === 'none' ? undefined : opts.bundler;
  let lintCategories: string[] = (opts['lint-categories'] || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  let typescript = opts.typescript === true;

  if (opts.interactive) {
    const mainEntryPointInput = await prompts.text({
      message: 'Main entry point',
      placeholder: 'src/main.ts',
      defaultValue: mainEntryPoint
    });

    if (prompts.isCancel(mainEntryPointInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    mainEntryPoint = mainEntryPointInput;

    const sourcesInput = await prompts.text({
      message: 'Source globs (comma-separated)',
      placeholder: 'src',
      defaultValue: sourcesString
    });

    if (prompts.isCancel(sourcesInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    sourcesString = sourcesInput;

    const testsInput = await prompts.text({
      message: 'Test globs (comma-separated)',
      placeholder: 'test',
      defaultValue: testsString
    });

    if (prompts.isCancel(testsInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    testsString = testsInput;

    const linterInput = await prompts.select({
      message: 'Choose a linter',
      options: toSelectOptions(LINTERS, true),
      initialValue: linter
    });

    if (prompts.isCancel(linterInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    linter = linterInput;

    if (linter !== undefined) {
      const lintCategoriesInput = await prompts.multiselect({
        message: 'Choose lint categories',
        options: Object.entries<string>(LINT_CATEGORIES).map(
          ([value, label]) => ({
            value,
            label
          })
        ),
        required: false
      });

      if (prompts.isCancel(lintCategoriesInput)) {
        prompts.cancel('Operation cancelled');
        return;
      }

      lintCategories = lintCategoriesInput;
    }

    const formatterInput = await prompts.select({
      message: 'Choose a formatter',
      options: toSelectOptions(FORMATTERS, true),
      initialValue: formatter
    });

    if (prompts.isCancel(formatterInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    formatter = formatterInput;

    const testFrameworkInput = await prompts.select({
      message: 'Choose a test framework',
      options: toSelectOptions(TEST_FRAMEWORKS, true),
      initialValue: testFramework
    });

    if (prompts.isCancel(testFrameworkInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    testFramework = testFrameworkInput;

    const uiFrameworkInput = await prompts.select({
      message: 'Choose a UI framework',
      options: toSelectOptions(UI_FRAMEWORKS, true),
      initialValue: uiFramework
    });

    if (prompts.isCancel(uiFrameworkInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    uiFramework = uiFrameworkInput;

    const bundlerInput = await prompts.select({
      message: 'Choose a bundler',
      options: toSelectOptions(BUNDLERS, true),
      initialValue: bundler
    });

    if (prompts.isCancel(bundlerInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    bundler = bundlerInput;

    const typescriptInput = await prompts.select({
      message: 'Use TypeScript?',
      options: [
        {value: true, label: 'Yes'},
        {value: false, label: 'No'}
      ],
      initialValue: typescript
    });

    if (prompts.isCancel(typescriptInput)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    typescript = typescriptInput;
  }

  if (linter !== undefined && !isValidOption(linter, LINTERS)) {
    prompts.log.error(
      `Invalid linter: ${linter}. Valid options: ${Object.keys(LINTERS).join(', ')}`
    );
    return;
  }

  if (formatter !== undefined && !isValidOption(formatter, FORMATTERS)) {
    prompts.log.error(
      `Invalid formatter: ${formatter}. Valid options: ${Object.keys(FORMATTERS).join(', ')}`
    );
    return;
  }

  if (
    testFramework !== undefined &&
    !isValidOption(testFramework, TEST_FRAMEWORKS)
  ) {
    prompts.log.error(
      `Invalid test framework: ${testFramework}. Valid options: ${Object.keys(TEST_FRAMEWORKS).join(', ')}`
    );
    return;
  }

  if (uiFramework !== undefined && !isValidOption(uiFramework, UI_FRAMEWORKS)) {
    prompts.log.error(
      `Invalid UI framework: ${uiFramework}. Valid options: ${Object.keys(UI_FRAMEWORKS).join(', ')}`
    );
    return;
  }

  if (bundler !== undefined && !isValidOption(bundler, BUNDLERS)) {
    prompts.log.error(
      `Invalid bundler: ${bundler}. Valid options: ${Object.keys(BUNDLERS).join(', ')}`
    );
    return;
  }

  for (const category of lintCategories) {
    if (!isValidOption(category, LINT_CATEGORIES)) {
      prompts.log.error(
        `Invalid lint category: ${category}. Valid options: ${Object.keys(LINT_CATEGORIES).join(', ')}`
      );
      return;
    }
  }

  const sources = sourcesString
    ?.split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const tests = testsString
    ?.split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  if (sources === undefined || sources.length === 0) {
    prompts.log.error('At least one source glob is required');
    return;
  }

  if (tests === undefined || tests.length === 0) {
    prompts.log.error('At least one test glob is required');
    return;
  }

  const config: Config = {
    mainEntryPoint,
    sources,
    tests,
    typescript
  };

  if (linter !== undefined) {
    config.linter = linter;
  }

  if (formatter !== undefined) {
    config.formatter = formatter;
  }

  if (testFramework !== undefined) {
    config.testFramework = testFramework;
  }

  if (uiFramework !== undefined) {
    config.uiFramework = uiFramework;
  }

  if (bundler !== undefined) {
    config.bundler = bundler;
  }

  if (lintCategories.length > 0) {
    config.lintConfig = {
      categories: lintCategories as LintCategory[]
    };
  }

  const context = new ConfiguratorContext(config, outDir);

  const spinner = prompts.spinner();
  spinner.start('Generating configuration files...');

  try {
    await execute(context);
    spinner.stop('Configuration files generated successfully!');

    prompts.outro(
      `All done! Your configuration files are ready in ${styleText(['bgGray'], outDir)} 🚀`
    );
  } catch (err) {
    spinner.stop('Failed to generate configuration files');

    if (err instanceof ConfigValidationError) {
      prompts.log.error(err.message);
      process.exit(1);
    } else {
      throw err;
    }
  }
}

export function cli(): void {
  const prog = sade('configurator <outDir>', true);

  prog
    .option('--main-entry-point', 'Main entry point', defaults.mainEntryPoint)
    .option('--sources', 'Source globs', defaults.sources.join(', '))
    .option('--tests', 'Test globs', defaults.tests.join(', '))
    .option(
      '--linter',
      'Linter (eslint, oxlint, biome)',
      defaults.linter ?? 'none'
    )
    .option(
      '--formatter',
      'Formatter (prettier, oxfmt, biome)',
      defaults.formatter ?? 'none'
    )
    .option(
      '--test-framework',
      'Test framework (jest, mocha, vitest)',
      defaults.testFramework ?? 'none'
    )
    .option(
      '--ui-framework',
      'UI framework (react, vue, svelte, lit, angular)',
      defaults.uiFramework ?? 'none'
    )
    .option(
      '--bundler',
      'Bundler (tsdown, zshy, typescript, rolldown, esbuild)',
      defaults.bundler ?? 'none'
    )
    .option(
      '--lint-categories',
      'Lint categories (correctness, performance, modernization)',
      defaults.lintConfig?.categories.join(',') ?? ''
    )
    .option('--typescript', 'Use TypeScript', defaults.typescript === true)
    .option('--interactive', 'Run in interactive mode', false)
    .action(handler);

  prog.parse(process.argv);
}
