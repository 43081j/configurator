import {describe, it, expect, vi} from 'vitest';
import {processor} from './oxfmt.js';
import type {Context} from '../types.js';

describe('oxfmt processor', () => {
  it('should do nothing if formatter is not oxfmt', async () => {
    const context: Context = {
      config: {
        mainEntryPoint: 'src/main.ts',
        formatter: 'prettier',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        typescript: false
      },
      addDevDependency: vi.fn(),
      addDependency: vi.fn(),
      emitFile: vi.fn()
    };

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(context.emitFile).not.toHaveBeenCalled();
  });

  it('should emit oxfmt config file and add dev dependency', async () => {
    const files: Record<string, unknown> = {};
    const context: Context = {
      config: {
        mainEntryPoint: 'src/main.ts',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        formatter: 'oxfmt',
        typescript: false
      },
      addDevDependency: vi.fn(),
      addDependency: vi.fn(),
      emitFile(file) {
        files[file.name] = file.contents;
        return Promise.resolve();
      }
    };

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('oxfmt', '^0.20.0');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });
});
