import {describe, it, expect, vi} from 'vitest';
import {processor} from './zshy.js';
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
      bundler: 'zshy',
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

describe('zshy processor', () => {
  it('should do nothing if bundler is not zshy', async () => {
    const {context, files} = createContext({bundler: 'tsdown'});

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
    expect(context.emitPackageField).not.toHaveBeenCalled();
  });

  it('should do nothing if there is no mainEntryPoint', async () => {
    const {context, files} = createContext({mainEntryPoint: ''});

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
    expect(context.emitPackageField).not.toHaveBeenCalled();
  });

  it('should emit zshy package field and scripts when bundler is zshy', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('zshy', '^0.7.0');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
    expect(context.emitPackageField).toHaveBeenCalledWith('zshy', {
      exports: {
        '.': 'src/main.ts'
      },
      cjs: false
    });
    expect(context.emitPackageField).toHaveBeenCalledWith('scripts', {
      build: 'zshy'
    });
  });
});
