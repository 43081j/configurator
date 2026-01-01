import {describe, it, expect, vi} from 'vitest';
import {processor} from './tsdown.js';
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
      bundler: 'tsdown',
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

describe('tsdown processor', () => {
  it('should do nothing if bundler is not tsdown', async () => {
    const {context, files} = createContext({bundler: 'zshy'});

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

  it('should emit tsdown config and package fields when bundler is tsdown', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('tsdown', '^0.18.4');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(context.emitPackageField).toHaveBeenCalledWith(
      'main',
      'dist/main.mjs'
    );
    expect(context.emitPackageField).toHaveBeenCalledWith('exports', {
      '.': 'dist/main.mjs'
    });
    expect(context.emitPackageField).toHaveBeenCalledWith('scripts', {
      build: 'tsdown'
    });
    expect(files).toMatchSnapshot();
  });

  it('should handle nested entrypoint paths correctly', async () => {
    const {context, files} = createContext({mainEntryPoint: 'src/foo/bar.ts'});

    await processor(context);

    expect(context.emitPackageField).toHaveBeenCalledWith(
      'main',
      'dist/bar.mjs'
    );
    expect(context.emitPackageField).toHaveBeenCalledWith('exports', {
      '.': 'dist/bar.mjs'
    });
    expect(files).toMatchSnapshot();
  });

  it('should handle entrypoint without directory', async () => {
    const {context, files} = createContext({mainEntryPoint: 'index.ts'});

    await processor(context);

    expect(context.emitPackageField).toHaveBeenCalledWith(
      'main',
      'dist/index.mjs'
    );
    expect(context.emitPackageField).toHaveBeenCalledWith('exports', {
      '.': 'dist/index.mjs'
    });
    expect(files).toMatchSnapshot();
  });

  it('should emit vue-specific config when uiFramework is vue', async () => {
    const {context, files} = createContext({uiFramework: 'vue'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('tsdown', '^0.18.4');
    expect(context.addDevDependency).toHaveBeenCalledWith(
      'unplugin-vue',
      '^6.2.0'
    );
    expect(files).toMatchSnapshot();
  });

  it('should emit react-specific config when uiFramework is react', async () => {
    const {context, files} = createContext({uiFramework: 'react'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('tsdown', '^0.18.4');
    expect(files).toMatchSnapshot();
  });

  it('should emit svelte-specific config when uiFramework is svelte', async () => {
    const {context, files} = createContext({uiFramework: 'svelte'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('tsdown', '^0.18.4');
    expect(context.addDevDependency).toHaveBeenCalledWith(
      'rollup-plugin-svelte',
      '^7.2.3'
    );
    expect(context.addDevDependency).toHaveBeenCalledWith(
      'svelte-preprocess',
      '^6.0.3'
    );
    expect(files).toMatchSnapshot();
  });
});
