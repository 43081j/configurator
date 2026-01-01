import {describe, it, expect, vi} from 'vitest';
import {processor} from './prettier.js';
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
      formatter: 'prettier',
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

describe('prettier processor', () => {
  it('should do nothing if formatter is not prettier', async () => {
    const {context, files} = createContext({formatter: 'oxfmt'});

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
  });

  it('should emit mocharc and add dev dependency', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('prettier', '^3.7.4');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });

  it('should add svelte support if ui framework is svelte', async () => {
    const {context, files} = createContext({uiFramework: 'svelte'});

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('prettier', '^3.7.4');
    expect(context.addDevDependency).toHaveBeenCalledWith(
      'prettier-plugin-svelte',
      '^3.4.1'
    );
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });
});
