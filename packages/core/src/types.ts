export type Linter = 'eslint' | 'oxlint' | 'biome';

export type Formatter = 'prettier' | 'oxfmt' | 'biome';

export type TestFramework = 'jest' | 'mocha' | 'vitest';

export type UIFramework = 'react' | 'vue' | 'svelte' | 'lit' | 'angular';

export type LintCategory = 'correctness' | 'performance' | 'modernization';

export interface LintConfig {
  categories: LintCategory[];
}

export interface Config {
  sources: string[];
  tests: string[];
  linter?: Linter;
  formatter?: Formatter;
  testFramework?: TestFramework;
  uiFramework?: UIFramework;
  lintConfig?: LintConfig;
  typescript: boolean;
}

export interface FileInfo {
  name: string;
  contents: unknown;
}

export interface Context {
  config: Config;
  emitFile: (file: FileInfo) => void;
}

export type Processor = (context: Context) => Promise<void>;

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
