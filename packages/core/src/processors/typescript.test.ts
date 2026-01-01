import {describe, it, expect, vi} from 'vitest';
import {processor} from './typescript.js';
import type {Context, Config} from '../types.js';

function createContext(configOverrides: Partial<Config> = {}): {
  context: Context;
  files: Record<string, unknown>;
} {
  const files: Record<string, unknown> = {};
  const context: Context = {
    config: {
      mainEntryPoint: 'src/main.ts',
      sources: ['src/**/*.ts'],
      tests: ['src/**/*.test.ts'],
      bundler: 'typescript',
      typescript: true,
      ...configOverrides
    },
    addDevDependency: vi.fn(),
    addDependency: vi.fn(),
    emitFile(file) {
      files[file.name] = file.contents;
      return Promise.resolve();
    },
    emitPackageField: vi.fn(),
    finalise: vi.fn().mockResolvedValue(undefined)
  };
  return {context, files};
}

describe('typescript processor', () => {
  it('should only add dependency & tsconfig if bundler is not typescript', async () => {
    const {context, files} = createContext({bundler: 'tsdown'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      'typescript',
      '^5.9.3'
    );
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
    expect(context.emitPackageField).not.toHaveBeenCalled();
  });

  it('should emit package fields and tsconfig', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      'typescript',
      '^5.9.3'
    );
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
    expect(context.emitPackageField).toHaveBeenCalledWith('scripts', {
      build: 'tsc'
    });
    expect(context.emitPackageField).toHaveBeenCalledWith(
      'main',
      'dist/main.js'
    );
    expect(context.emitPackageField).toHaveBeenCalledWith('exports', {
      '.': 'dist/main.js'
    });
  });
});
