import {execute, ConfigValidationError} from '@43081j/configurator-core';
import type {FileInfo, Config, Context} from '@43081j/configurator-core';

export interface GeneratedContent {
  files: FileInfo[];
  dependencies: Map<string, string>;
  devDependencies: Map<string, string>;
  error: string | undefined;
  packageJSON: Record<string, unknown>;
}

export async function generateContent(
  config: Config
): Promise<GeneratedContent> {
  const files: FileInfo[] = [];
  const dependencies = new Map<string, string>();
  const devDependencies = new Map<string, string>();
  const packageJSON: Record<string, unknown> = {
    name: 'generated-project',
    version: '1.0.0',
    dependencies: {},
    devDependencies: {}
  };
  let error: string | undefined;

  const context: Context = {
    config,
    emitFile: async (file) => {
      files.push(file);
    },
    addDependency: (name, version) => {
      dependencies.set(name, version);
    },
    addDevDependency: (name, version) => {
      devDependencies.set(name, version);
    },
    emitPackageField: (name, value) => {
      const isValuePlainObject =
        typeof value === 'object' && value !== null && !Array.isArray(value);
      const currentValue = packageJSON[name];
      const isCurrentPlainObject =
        typeof currentValue === 'object' &&
        currentValue !== null &&
        !Array.isArray(currentValue);

      if (isValuePlainObject && isCurrentPlainObject) {
        packageJSON[name] = {
          ...currentValue,
          ...value
        };
      } else {
        packageJSON[name] = value;
      }
    },
    finalise: async () => {
      files.push({
        name: 'package.json',
        contents: packageJSON
      });
    }
  };

  try {
    await execute(context);
  } catch (err) {
    if (err instanceof ConfigValidationError) {
      error = err.message;
    } else {
      throw err;
    }
  }

  return {files, dependencies, devDependencies, error, packageJSON};
}
