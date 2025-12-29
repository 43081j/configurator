import {describe, it, expect, vi} from 'vitest';
import {processor} from './eslint.js';
import type {Context, Config} from '../types.js';

function createContext(configOverrides: Partial<Config> = {}): {
  context: Context;
  files: Record<string, unknown>;
} {
  const files: Record<string, unknown> = {};
  const context: Context = {
    config: {
      sources: ['src/**/*.ts'],
      tests: ['src/**/*.test.ts'],
      linter: 'eslint',
      typescript: false,
      ...configOverrides
    },
    addDevDependency: vi.fn(),
    addDependency: vi.fn(),
    emitFile(file) {
      files[file.name] = file.contents;
      return Promise.resolve();
    }
  };
  return {context, files};
}

describe('eslint processor', () => {
  it('should do nothing if linter is not eslint', async () => {
    const {context, files} = createContext({linter: 'oxlint'});

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
  });

  it('should emit eslint config and add dependencies', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('eslint', '^9.39.2');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });

  it('should add typescript support if typescript is true', async () => {
    const {context, files} = createContext({typescript: true});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      'typescript-eslint',
      '^8.51.0'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });

  it('should add react plugin if ui framework is react', async () => {
    const {context, files} = createContext({uiFramework: 'react'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      '@eslint-react/eslint-plugin',
      '^2.4.0'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });

  it('should add vue plugin if ui framework is vue', async () => {
    const {context, files} = createContext({uiFramework: 'vue'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      'eslint-plugin-vue',
      '^10.6.2'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });

  it('should add svelte plugin if ui framework is svelte', async () => {
    const {context, files} = createContext({uiFramework: 'svelte'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      'eslint-plugin-svelte',
      '^3.13.1'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });

  it('should add svelte plugin with typescript support', async () => {
    const {context, files} = createContext({
      uiFramework: 'svelte',
      typescript: true
    });

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add lit plugin if ui framework is lit', async () => {
    const {context, files} = createContext({uiFramework: 'lit'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      'eslint-plugin-lit',
      '^2.1.1'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });

  it('should add angular plugin if ui framework is angular', async () => {
    const {context, files} = createContext({uiFramework: 'angular'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      'angular-eslint',
      '^21.1.0'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });

  it('should add mocha globals if test framework is mocha', async () => {
    const {context, files} = createContext({testFramework: 'mocha'});

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add browser globals if ui framework is set', async () => {
    const {context, files} = createContext({uiFramework: 'lit'});

    await processor(context);

    expect(files).toMatchSnapshot();
  });

  it('should add e18e plugin if lintConfig includes modernization', async () => {
    const {context, files} = createContext({
      lintConfig: {categories: ['modernization']}
    });

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      '@e18e/eslint-plugin',
      '^0.1.3'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });

  it('should add e18e plugin if lintConfig includes performance', async () => {
    const {context, files} = createContext({
      lintConfig: {categories: ['performance']}
    });

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith(
      '@e18e/eslint-plugin',
      '^0.1.3'
    );
    expect(context.addDependency).not.toHaveBeenCalledWith();
    expect(files).toMatchSnapshot();
  });
});
