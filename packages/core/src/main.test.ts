import {describe, it, expect, vi} from 'vitest';
import {execute, defaults, ConfigValidationError} from './main.js';
import type {Context} from './types.js';

describe('main', () => {
  it('should have default configuration', () => {
    expect(defaults).toEqual({
      mainEntryPoint: 'src/main.ts',
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
          mainEntryPoint: 'src/main.ts',
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
        addDevDependency: vi.fn(),
        emitPackageField: vi.fn(),
        finalise: vi.fn().mockResolvedValue(undefined)
      };

      await execute(context);

      expect(context.addDependency).not.toHaveBeenCalled();
      expect(context.addDevDependency).toHaveBeenCalled();
      expect(files).toMatchSnapshot();
    });

    it('should throw when bundler requires entry point but none set', async () => {
      const context: Context = {
        config: {
          mainEntryPoint: '',
          sources: ['src/**/*.ts'],
          tests: ['src/**/*.test.ts'],
          bundler: 'tsdown',
          typescript: true
        },
        emitFile: vi.fn(),
        addDependency: vi.fn(),
        addDevDependency: vi.fn(),
        emitPackageField: vi.fn(),
        finalise: vi.fn().mockResolvedValue(undefined)
      };

      await expect(execute(context)).rejects.toThrow(ConfigValidationError);
      await expect(execute(context)).rejects.toThrow(
        'Bundler "tsdown" requires a main entry point to be specified'
      );
    });

    it('should not throw when bundler requires entry point and one is set', async () => {
      const context: Context = {
        config: {
          mainEntryPoint: 'src/index.ts',
          sources: ['src/**/*.ts'],
          tests: ['src/**/*.test.ts'],
          bundler: 'esbuild',
          typescript: true
        },
        emitFile: vi.fn(),
        addDependency: vi.fn(),
        addDevDependency: vi.fn(),
        emitPackageField: vi.fn(),
        finalise: vi.fn().mockResolvedValue(undefined)
      };

      await expect(execute(context)).resolves.not.toThrow();
    });

    it('should not throw when bundler does not require entry point and none set', async () => {
      const context: Context = {
        config: {
          mainEntryPoint: '',
          sources: ['src/**/*.ts'],
          tests: ['src/**/*.test.ts'],
          bundler: 'typescript',
          typescript: true
        },
        emitFile: vi.fn(),
        addDependency: vi.fn(),
        addDevDependency: vi.fn(),
        emitPackageField: vi.fn(),
        finalise: vi.fn().mockResolvedValue(undefined)
      };

      await expect(execute(context)).resolves.not.toThrow();
    });
  });
});
