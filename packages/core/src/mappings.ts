import type {
  Linter,
  Formatter,
  TestFramework,
  UIFramework,
  Processor
} from './types.js';

export const linterProcessors: Map<Linter, Processor> = new Map<
  Linter,
  Processor
>();
export const formatterProcessors: Map<Formatter, Processor> = new Map<
  Formatter,
  Processor
>();
export const testFrameworkProcessors: Map<TestFramework, Processor> = new Map<
  TestFramework,
  Processor
>();
export const uiFrameworkProcessors: Map<UIFramework, Processor> = new Map<
  UIFramework,
  Processor
>();
