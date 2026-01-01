import {describe, it, expect, vi} from 'vitest';
import {processor} from './oxlint.js';
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
      linter: 'oxlint',
      typescript: false,
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

describe('oxlint processor', () => {
  it('should do nothing if linter is not oxlint', async () => {
    const {context, files} = createContext({linter: 'eslint'});

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
  });

  it('should emit oxlintrc and add dependencies', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('oxlint', '^1.35.0');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });

  it('should add browser env if ui framework is set', async () => {
    const {context, files} = createContext({uiFramework: 'lit'});

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add typescript plugin if typescript is true', async () => {
    const {context, files} = createContext({typescript: true});

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add react plugin if ui framework is react', async () => {
    const {context, files} = createContext({
      uiFramework: 'react'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add react-perf plugin if react & perf category enabled', async () => {
    const {context, files} = createContext({
      uiFramework: 'react',
      lintConfig: {
        categories: ['performance']
      }
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add react plugin if ui framework is preact', async () => {
    const {context, files} = createContext({
      uiFramework: 'preact'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add react-perf plugin if preact & perf category enabled', async () => {
    const {context, files} = createContext({
      uiFramework: 'preact',
      lintConfig: {
        categories: ['performance']
      }
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add vue plugin if ui framework is vue', async () => {
    const {context, files} = createContext({
      uiFramework: 'vue'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add svelte plugin if ui framework is svelte', async () => {
    const {context, files} = createContext({
      uiFramework: 'svelte'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
    expect(context.addDevDependency).toHaveBeenCalledWith(
      'eslint-plugin-svelte',
      '^3.13.1'
    );
  });

  it('should add lit plugin if ui framework is lit', async () => {
    const {context, files} = createContext({
      uiFramework: 'lit'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
    expect(context.addDevDependency).toHaveBeenCalledWith(
      'eslint-plugin-lit',
      '^2.1.1'
    );
  });

  it('should add jest plugin if test framework is jest', async () => {
    const {context, files} = createContext({
      testFramework: 'jest'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add vitest plugin if test framework is vitest', async () => {
    const {context, files} = createContext({
      testFramework: 'vitest'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add mocha env if test framework is mocha', async () => {
    const {context, files} = createContext({
      testFramework: 'mocha'
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });
});
