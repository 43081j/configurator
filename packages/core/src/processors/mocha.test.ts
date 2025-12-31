import {describe, it, expect, vi} from 'vitest';
import {processor} from './mocha.js';
import type {Context} from '../types.js';

describe('mocha processor', () => {
  it('should do nothing if test framework is not mocha', async () => {
    const context: Context = {
      config: {
        mainEntryPoint: 'src/main.ts',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        testFramework: 'jest',
        typescript: false
      },
      addDevDependency: vi.fn(),
      addDependency: vi.fn(),
      emitFile: vi.fn(),
      emitPackageField: vi.fn(),
      finalise: vi.fn().mockResolvedValue(undefined)
    };

    await processor(context);

    expect(context.addDevDependency).not.toHaveBeenCalled();
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(context.emitFile).not.toHaveBeenCalled();
  });

  it('should emit mocharc and add dependencies', async () => {
    const files: Record<string, unknown> = {};
    const context: Context = {
      config: {
        mainEntryPoint: 'src/main.ts',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        testFramework: 'mocha',
        typescript: false
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

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('mocha', '^11.7.5');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });

  it('should add typescript support if typescript is true', async () => {
    const files: Record<string, unknown> = {};
    const context: Context = {
      config: {
        mainEntryPoint: 'src/main.ts',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        testFramework: 'mocha',
        typescript: true
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

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('mocha', '^11.7.5');
    expect(context.addDevDependency).toHaveBeenCalledWith('ts-node', '^10.9.2');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(files).toMatchSnapshot();
  });
});
