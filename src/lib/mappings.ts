import type {
  Linter,
  Formatter,
  TestFramework,
  UIFramework,
  Processor
} from './types.js';

export const linterProcessors = new Map<Linter, Processor>();
export const formatterProcessors = new Map<Formatter, Processor>();
export const testFrameworkProcessors = new Map<TestFramework, Processor>();
export const uiFrameworkProcessors = new Map<UIFramework, Processor>();
