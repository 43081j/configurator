import type {Processor, MochaConfig} from '../types.js';

export const processor: Processor = async (context) => {
  if (context.config.testFramework !== 'mocha') {
    return;
  }

  context.addDevDependency('mocha', '^11.7.5');

  const config: MochaConfig = {};

  if (context.config.typescript) {
    context.addDevDependency('ts-node', '^10.9.2');
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
