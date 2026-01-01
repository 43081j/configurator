export type Linter = 'eslint' | 'oxlint' | 'biome';

export type Formatter = 'prettier' | 'oxfmt' | 'biome';

export type TestFramework = 'jest' | 'mocha' | 'vitest';

export type UIFramework =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'lit'
  | 'angular'
  | 'preact';

export type Bundler = 'tsdown' | 'zshy' | 'typescript' | 'rolldown' | 'esbuild';

export type LintCategory = 'correctness' | 'performance' | 'modernization';

export interface LintConfig {
  categories: LintCategory[];
}

export interface Config {
  mainEntryPoint: string;
  sources: string[];
  tests: string[];
  linter?: Linter;
  formatter?: Formatter;
  testFramework?: TestFramework;
  uiFramework?: UIFramework;
  bundler?: Bundler;
  lintConfig?: LintConfig;
  typescript: boolean;
}

export interface FileInfo {
  name: string;
  contents: unknown;
}

export interface Context {
  config: Config;
  emitFile: (file: FileInfo) => Promise<void>;
  addDependency: (name: string, version: string) => void;
  addDevDependency: (name: string, version: string) => void;
  emitPackageField: (name: string, value: unknown) => void;
  finalise: () => Promise<void>;
}

export type Processor = (context: Context) => Promise<void>;

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export type OxlintRuleConfig = string | [string, Record<string, unknown>];
export interface OverlintConfigBase {
  plugins?: string[];
  rules?: Record<string, OxlintRuleConfig>;
  env?: Record<string, boolean>;
  globals?: Record<string, string | boolean>;
}
export interface OxlintOverride extends OverlintConfigBase {
  files: string[];
}
export interface OxlintConfig extends OverlintConfigBase {
  overrides?: OxlintOverride[];
  categories?: Record<string, string>;
  ignorePatterns?: string[];
}

export interface PrettierConfig {
  plugins?: string[];
  bracketSpacing: boolean;
  printWidth: number;
  semi: boolean;
  singleQuote: boolean;
  tabWidth: number;
  trailingComma: 'none' | 'es5' | 'all';
  useTabs: boolean;
  arrowParens: 'avoid' | 'always';
  parser?: string;
  overrides?: Array<{
    files: string | string[];
    options: Partial<PrettierConfig>;
  }>;
}

// TODO (jg): this interface is probably nonsense, oxfmt doesn't publish
// this type yet it seems. so im just guessing based on the rust source!
export interface OxfmtConfig {
  arrowParentheses?: 'always' | 'as_needed';
  indentStyle?: 'space' | 'tab';
  indentWidth?: number;
  lineWidth?: number;
  quoteStyle?: 'single' | 'double';
  semi?: boolean;
  semicolons?: 'always' | 'as_needed';
  trailingCommas?: 'none' | 'es5' | 'all';
}

export interface MochaConfig {
  diff?: boolean;
  extension?: string[];
  require?: string;
  loader?: string;
  package?: string;
  reporter?: string;
  slow?: string | number;
  timeout?: string | number;
  ui?: string;
  'watch-files'?: string[];
  'watch-ignore'?: string[];
  spec?: string[];
}

export interface BiomeConfig {
  files:
    | {
        includes?: string[];
      }
    | undefined;
  formatter:
    | {
        enabled: boolean;
        useEditorconfig?: boolean;
        bracketSpacing?: boolean;
      }
    | undefined;
  linter:
    | {
        enabled: boolean;
        domains?: Record<string, string>;
        rules?: Record<string, string | {recommended: boolean}>;
      }
    | undefined;
  javascript:
    | {
        formatter: {
          quoteStyle?: 'single' | 'double';
          trailingCommas?: 'none' | 'es5' | 'all';
          semicolons?: 'always' | 'asNeeded';
          arrowParentheses?: 'always' | 'asNeeded';
        };
      }
    | undefined;
}

export interface ZshyConfig {
  exports: Record<string, string>;
  cjs: boolean;
}
