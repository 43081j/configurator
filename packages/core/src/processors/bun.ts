import type {Processor} from '../types.js';

export const processor: Processor = async (context) => {
  const isBunTestRunner = context.config.testRunner === 'bun';

  if (!isBunTestRunner) {
    return;
  }

  context.addDevDependency('@types/bun', '^1.3.10');
};
