import {
  linterProcessors,
  formatterProcessors,
  testFrameworkProcessors,
  uiFrameworkProcessors
} from './mappings.js';
import type {Context, Processor} from './types.js';

export * from './types.js';

export async function execute(context: Context): Promise<void> {
  const {config} = context;

  const processors: Processor[] = [];

  if (config.linter) {
    const linterProcessor = linterProcessors.get(config.linter);
    if (linterProcessor) {
      processors.push(linterProcessor);
    }
  }

  if (config.formatter) {
    const formatterProcessor = formatterProcessors.get(config.formatter);
    if (formatterProcessor) {
      processors.push(formatterProcessor);
    }
  }

  if (config.testFramework) {
    const testFrameworkProcessor = testFrameworkProcessors.get(
      config.testFramework
    );
    if (testFrameworkProcessor) {
      processors.push(testFrameworkProcessor);
    }
  }

  if (config.uiFramework) {
    const uiFrameworkProcessor = uiFrameworkProcessors.get(config.uiFramework);
    if (uiFrameworkProcessor) {
      processors.push(uiFrameworkProcessor);
    }
  }

  for (const processor of processors) {
    await processor(context);
  }
}
