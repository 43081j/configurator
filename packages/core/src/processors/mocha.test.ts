import {describe, it, expect, vi} from 'vitest';
import {processor} from './mocha.js';
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
      testFramework: 'mocha',
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

describe('mocha processor', () => {
  it('should do nothing if test framework is not mocha', async () => {
    const {context, files} = createContext({testFramework: 'jest'});

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
  });

  it('should emit mocharc and add dependencies', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('mocha', '^11.7.5');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });

  it('should add typescript support if typescript is true', async () => {
    const {context, files} = createContext({typescript: true});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('mocha', '^11.7.5');
    expect(context.addDevDependency).toHaveBeenCalledWith('ts-node', '^10.9.2');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });
});
