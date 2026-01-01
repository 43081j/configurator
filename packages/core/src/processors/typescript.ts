import type {Processor, Context} from '../types.js';

const processBundler = async (context: Context) => {
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
    build: 'tsgo'
  });
};

export const processor: Processor = async (context) => {
  if (!context.config.typescript) {
    return;
  }

  if (context.config.bundler === 'typescript') {
    await processBundler(context);
  }

  context.addDevDependency(
    '@typescript/native-preview',
    '^7.0.0-dev.20260101.1'
  );
  context.addDevDependency('@tsconfig/strictest', '^2.0.8');
  context.emitFile({
    name: 'tsconfig.json',
    contents: {
      extends: '@tsconfig/strictest/tsconfig.json',
      compilerOptions: {
        module: 'node18',
        target: 'esnext',
        types: [],
        outDir: 'dist',
        declaration: true,
        sourceMap: false,
        erasableSyntaxOnly: true
      },
      // TODO (jg): maybe transform this to the root dir, e.g. `src`?
      // instead of a glob
      include: context.config.sources
    }
  });
};
