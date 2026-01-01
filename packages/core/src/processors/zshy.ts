import type {Processor, ZshyConfig} from '../types.js';

export const processor: Processor = async (context) => {
  if (context.config.bundler !== 'zshy') {
    return;
  }

  if (!context.config.mainEntryPoint) {
    return;
  }

  context.addDevDependency('zshy', '^0.7.0');

  const zshyConfig: ZshyConfig = {
    exports: {
      '.': context.config.mainEntryPoint
    },
    cjs: false
  };

  context.emitPackageField('zshy', zshyConfig);

  context.emitPackageField('scripts', {
    build: 'zshy'
  });
};
