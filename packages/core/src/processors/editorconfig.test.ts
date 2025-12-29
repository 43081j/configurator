import {describe, it, expect, vi} from 'vitest';
import {processor} from './editorconfig.js';
import type {Context} from '../types.js';

describe('editorconfig processor', () => {
  it('should do nothing if formatter is not defined', async () => {
    const context: Context = {
      config: {
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

  it('should emit .editorconfig file', async () => {
    const files: Record<string, unknown> = {};
    const context: Context = {
      config: {
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        formatter: 'prettier',
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

    expect(files).toMatchSnapshot();
  });
});
