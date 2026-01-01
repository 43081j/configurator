import type {Processor} from '../types.js';

export const processor: Processor = async (context) => {
  if (context.config.typescript) {
    context.addDevDependency('typescript', '^5.9.3');
  }

  if (context.config.bundler !== 'typescript') {
    return;
  }

  const entrypoint = context.config.mainEntryPoint;
  const pathWithoutFirstSegment = entrypoint.split('/', 2)[1];

  // TODO (jg): maybe one day throw an error if entrypoint isn't in a subdir?
  if (!pathWithoutFirstSegment) {
    return;
  }

  const outputPath = pathWithoutFirstSegment.replace(/\.ts$/, '.js');
  const mainField = `dist/${outputPath}`;

  context.emitPackageField('main', mainField);
  context.emitPackageField('exports', {
    '.': mainField
  });
  context.emitPackageField('scripts', {
    build: 'tsc'
  });
};
