import type {Processor, MochaConfig} from '../types.js';

export const processor: Processor = async (context) => {
  if (context.config.testFramework !== 'mocha') {
    return;
  }

  const config: MochaConfig = {};

  if (context.config.typescript) {
    config.extension = ['ts'];
    config.require = 'ts-node/register';
    config.loader = 'ts-node/esm';
    config.spec = context.config.tests;
  }

  await context.emitFile({
    name: '.mocharc.json',
    contents: config
  });
};
