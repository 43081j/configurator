import type {Processor} from '../types.js';

export const processor: Processor = async (context) => {
  const isBunTestRunner = context.config.testFramework === 'bun';

  if (!isBunTestRunner) {
    return;
  }

  context.addDevDependency('@types/bun', '^1.3.10');
};
