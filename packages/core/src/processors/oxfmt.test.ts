import {describe, it, expect, vi} from 'vitest';
import {processor} from './oxfmt.js';
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
      formatter: 'oxfmt',
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

describe('oxfmt processor', () => {
  it('should do nothing if formatter is not oxfmt', async () => {
    const {context, files} = createContext({formatter: 'prettier'});

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
  });

  it('should emit oxfmt config file and add dev dependency', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('oxfmt', '^0.20.0');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });
});
