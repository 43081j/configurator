import * as prompts from '@clack/prompts';
import sade from 'sade';
import {writeFile, mkdir, access} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {styleText} from 'node:util';
import {
  execute,
  type Config,
  type Context,
  type FileInfo,
  type Linter,
  type Formatter,
  type TestFramework,
  type UIFramework
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
  private outDir: string;

  constructor(config: Config, outDir: string) {
    this.config = config;
    this.outDir = outDir;
  }

  async emitFile(file: FileInfo): Promise<void> {
    const filePath = join(this.outDir, file.name);
    await mkdir(dirname(filePath), {recursive: true});
    const contents =
      typeof file.contents === 'string'
        ? file.contents
        : JSON.stringify(file.contents, null, 2);
    await writeFile(filePath, contents, 'utf-8');
  }
}

export function cli(): void {
  const prog = sade('configurator <outDir>', true);

  prog
    .option('--sources', 'Source globs', 'src')
    .option('--tests', 'Test globs', 'test')
    .option('--linter', 'Linter (eslint, oxlint, biome)', 'eslint')
    .option('--formatter', 'Formatter (prettier, oxfmt, biome)', 'prettier')
    .option(
      '--test-framework',
      'Test framework (jest, mocha, vitest)',
      'vitest'
    )
    .option(
      '--ui-framework',
      'UI framework (react, vue, svelte, lit, angular)',
      'svelte'
    )
    .option('--typescript', 'Use TypeScript', false)
    .option('--interactive', 'Run in interactive mode', false)
    .action(async (outDir, opts) => {
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

      let sourcesString = opts.sources;
      let testsString = opts.tests;
      let linter: string | undefined = opts.linter;
      let formatter: string | undefined = opts.formatter;
      let testFramework: string | undefined = opts['test-framework'];
      let uiFramework: string | undefined = opts['ui-framework'];
      let typescript = opts.typescript;

      if (opts.interactive) {
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

      if (
        uiFramework !== undefined &&
        !isValidOption(uiFramework, UI_FRAMEWORKS)
      ) {
        prompts.log.error(
          `Invalid UI framework: ${uiFramework}. Valid options: ${Object.keys(UI_FRAMEWORKS).join(', ')}`
        );
        return;
      }

      const sources = sourcesString
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const tests = testsString
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);

      if (sources.length === 0) {
        prompts.log.error('At least one source glob is required');
        return;
      }

      if (tests.length === 0) {
        prompts.log.error('At least one test glob is required');
        return;
      }

      const config: Config = {
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

      const context = new ConfiguratorContext(config, outDir);

      const spinner = prompts.spinner();
      spinner.start('Generating configuration files...');
      await execute(context);
      spinner.stop('Configuration files generated successfully!');

      prompts.outro(
        `All done! Your configuration files are ready in ${styleText(['bgGray'], outDir)} 🚀`
      );
    });

  prog.parse(process.argv);
}
