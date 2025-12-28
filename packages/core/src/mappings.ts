import type {
  Linter,
  Formatter,
  TestFramework,
  UIFramework,
  Processor
} from './types.js';
import {processor as oxlintProcessor} from './processors/oxlint.js';

export const linterProcessors: Map<Linter, Processor> = new Map<
  Linter,
  Processor
>([['oxlint', oxlintProcessor]]);
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
