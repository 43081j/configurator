import type {Processor, Context} from '../types.js';

const createVitestConfig = (context: Context): string =>
  `
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ${JSON.stringify(context.config.tests)}
  }
});
`.trim();

export const processor: Processor = async (context) => {
  if (context.config.testFramework !== 'vitest') {
    return;
  }

  const config = createVitestConfig(context);

  await context.emitFile({
    name: `vitest.config.${context.config.typescript ? 'ts' : 'js'}`,
    contents: config
  });
};
