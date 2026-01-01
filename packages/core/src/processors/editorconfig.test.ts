import {describe, it, expect, vi} from 'vitest';
import {processor} from './editorconfig.js';
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

describe('editorconfig processor', () => {
  it('should do nothing if formatter is not defined', async () => {
    const {context, files} = createContext();
    delete context.config.formatter;

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toEqual({});
  });

  it('should emit .editorconfig file', async () => {
    const {context, files} = createContext();

    await processor(context);

    expect(files).toMatchSnapshot();
  });
});
