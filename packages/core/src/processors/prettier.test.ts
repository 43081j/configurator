import {describe, it, expect, vi} from 'vitest';
import {processor} from './prettier.js';
import type {Context} from '../types.js';

describe('prettier processor', () => {
  it('should do nothing if formatter is not prettier', async () => {
    const context: Context = {
      config: {
        formatter: 'oxfmt',
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

  it('should emit mocharc and add dev dependency', async () => {
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

    expect(context.addDevDependency).toHaveBeenCalledWith('prettier', '^3.7.4');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });

  it('should add svelte support if ui framework is svelte', async () => {
    const files: Record<string, unknown> = {};
    const context: Context = {
      config: {
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        formatter: 'prettier',
        typescript: false,
        uiFramework: 'svelte'
      },
      addDevDependency: vi.fn(),
      addDependency: vi.fn(),
      emitFile(file) {
        files[file.name] = file.contents;
        return Promise.resolve();
      }
    };

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
