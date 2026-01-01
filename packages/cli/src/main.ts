import * as prompts from '@clack/prompts';
import sade from 'sade';
import {writeFile, mkdir, access} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {styleText} from 'node:util';
import {
  execute,
  ConfigValidationError,
  LINTERS,
  FORMATTERS,
  TEST_FRAMEWORKS,
  UI_FRAMEWORKS,
  BUNDLERS,
  LINT_CATEGORIES,
  INCOMPATIBLE_BUNDLERS,
  type Config,
  type Context,
  type FileInfo,
  type LintCategory,
  type LabeledOption,
  type UIFramework,
  type Bundler,
  defaults
} from '@43081j/configurator-core';

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
  options: Array<LabeledOption<T>>
): value is T {
  return options.some((opt) => opt.value === value);
}

type OptionLike<T> = {
  value: T | undefined;
  label: string;
  disabled?: boolean;
};

function toSelectOptions<T extends string>(
  options: Array<LabeledOption<T>>,
  includeNone = false,
  disabledValues: Array<T | 'none'> = []
): Array<OptionLike<T>> {
  const opts = options.map<OptionLike<T>>((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: disabledValues.includes(opt.value)
  }));

  if (includeNone) {
    opts.unshift({
      value: undefined,
      label: 'None',
      disabled: disabledValues.includes('none')
    });
  }

  return opts;
}

class ConfiguratorContext implements Context {
  public config: Config;
  #outDir: string;
  #devDependencies: Record<string, string> = {};
  #dependencies: Record<string, string> = {};
  #packageJSON: Record<string, unknown> = {
    name: 'generated-project',
    version: '1.0.0',
    type: 'module',
    dependencies: {},
    devDependencies: {}
  };

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

  emitPackageField(name: string, value: unknown): void {
    const isValuePlainObject =
      typeof value === 'object' && value !== null && !Array.isArray(value);
    const currentValue = this.#packageJSON[name];
    const isCurrentPlainObject =
      typeof currentValue === 'object' &&
      currentValue !== null &&
      !Array.isArray(currentValue);

    if (isValuePlainObject && isCurrentPlainObject) {
      this.#packageJSON[name] = {
        ...currentValue,
        ...value
      };
    } else {
      this.#packageJSON[name] = value;
    }
  }

  async finalise(): Promise<void> {
    const packageJsonPath = join(this.#outDir, 'package.json');

    this.#packageJSON.dependencies = this.#dependencies;
    this.#packageJSON.devDependencies = this.#devDependencies;

    try {
      await access(packageJsonPath);
    } catch {
      await writeFile(
        packageJsonPath,
        JSON.stringify(this.#packageJSON, null, 2),
        'utf-8'
      );
    }
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
        options: LINT_CATEGORIES.map((opt) => ({
          value: opt.value,
          label: opt.label
        })),
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

    const incompatibleBundlers: Array<Bundler | 'none'> =
      INCOMPATIBLE_BUNDLERS[uiFramework as UIFramework] ?? [];

    const bundlerInput = await prompts.select({
      message: 'Choose a bundler',
      options: toSelectOptions(BUNDLERS, true, incompatibleBundlers),
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
      `Invalid linter: ${linter}. Valid options: ${LINTERS.map((l) => l.value).join(', ')}`
    );
    return;
  }

  if (formatter !== undefined && !isValidOption(formatter, FORMATTERS)) {
    prompts.log.error(
      `Invalid formatter: ${formatter}. Valid options: ${FORMATTERS.map((f) => f.value).join(', ')}`
    );
    return;
  }

  if (
    testFramework !== undefined &&
    !isValidOption(testFramework, TEST_FRAMEWORKS)
  ) {
    prompts.log.error(
      `Invalid test framework: ${testFramework}. Valid options: ${TEST_FRAMEWORKS.map((t) => t.value).join(', ')}`
    );
    return;
  }

  if (uiFramework !== undefined && !isValidOption(uiFramework, UI_FRAMEWORKS)) {
    prompts.log.error(
      `Invalid UI framework: ${uiFramework}. Valid options: ${UI_FRAMEWORKS.map((u) => u.value).join(', ')}`
    );
    return;
  }

  if (bundler !== undefined && !isValidOption(bundler, BUNDLERS)) {
    prompts.log.error(
      `Invalid bundler: ${bundler}. Valid options: ${BUNDLERS.map((b) => b.value).join(', ')}`
    );
    return;
  }

  for (const category of lintCategories) {
    if (!isValidOption(category, LINT_CATEGORIES)) {
      prompts.log.error(
        `Invalid lint category: ${category}. Valid options: ${LINT_CATEGORIES.map((c) => c.value).join(', ')}`
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
      'UI framework (react, vue, svelte, lit, angular, preact)',
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
