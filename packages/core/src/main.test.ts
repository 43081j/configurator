import {describe, it, expect, vi} from 'vitest';
import {execute, defaults} from './main.js';
import type {Context} from './types.js';

describe('main', () => {
  it('should have default configuration', () => {
    expect(defaults).toEqual({
      tests: ['src/**/*.test.ts'],
      sources: ['src/**/*.ts'],
      linter: 'eslint',
      formatter: 'prettier',
      lintConfig: {
        categories: ['correctness', 'performance', 'modernization']
      },
      typescript: true
    });
  });

  describe('execute', () => {
    it('should process context without errors', async () => {
      const files: Record<string, unknown> = {};
      const context: Context = {
        config: {
          sources: ['src/**/*.ts'],
          tests: ['src/**/*.test.ts'],
          linter: 'oxlint',
          lintConfig: {
            categories: ['correctness']
          },
          typescript: true
        },
        emitFile(file) {
          files[file.name] = file.contents;
          return Promise.resolve();
        },
        addDependency: vi.fn(),
        addDevDependency: vi.fn()
      };

      await execute(context);

      expect(context.addDependency).not.toHaveBeenCalled();
      expect(context.addDevDependency).toHaveBeenCalled();
      expect(files).toMatchSnapshot();
    });
  });
});
