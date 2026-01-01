import {describe, it, expect, vi} from 'vitest';
import {processor} from './zshy.js';
import type {Context} from '../types.js';

describe('zshy processor', () => {
  it('should do nothing if bundler is not zshy', async () => {
    const context: Context = {
      config: {
        mainEntryPoint: 'src/main.ts',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        bundler: 'tsdown',
        typescript: true
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
    expect(context.emitPackageField).not.toHaveBeenCalled();
  });

  it('should do nothing if there is no mainEntryPoint', async () => {
    const context: Context = {
      config: {
        mainEntryPoint: '',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        bundler: 'zshy',
        typescript: true
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
    expect(context.emitPackageField).not.toHaveBeenCalled();
  });

  it('should emit zshy package field and scripts when bundler is zshy', async () => {
    const context: Context = {
      config: {
        mainEntryPoint: 'src/main.ts',
        sources: ['src/**/*.ts'],
        tests: ['tests/**/*.test.ts'],
        bundler: 'zshy',
        typescript: true
      },
      addDevDependency: vi.fn(),
      addDependency: vi.fn(),
      emitFile: vi.fn(),
      emitPackageField: vi.fn(),
      finalise: vi.fn().mockResolvedValue(undefined)
    };

    await processor(context);

    expect(context.addDevDependency).toHaveBeenCalledWith('zshy', '^0.7.0');
    expect(context.addDependency).not.toHaveBeenCalled();
    expect(context.emitFile).not.toHaveBeenCalled();
    expect(context.emitPackageField).toHaveBeenCalledWith('zshy', {
      exports: {
        '.': 'src/main.ts'
      },
      cjs: false
    });
    expect(context.emitPackageField).toHaveBeenCalledWith('scripts', {
      build: 'zshy'
    });
  });
});
