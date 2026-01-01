import type {Processor, Context} from '../types.js';

const createTsdownConfig = (context: Context): string => {
  const imports: string[] = [`import { defineConfig } from 'tsdown'`];
  const options: string[] = [
    `entry: [${JSON.stringify(context.config.mainEntryPoint)}]`
  ];

  switch (context.config.uiFramework) {
    case 'vue':
      imports.push(`import vue from 'unplugin-vue/rolldown'`);
      options.push(
        `platform: 'neutral'`,
        `plugins: [vue({ isProduction: true })]`,
        `dts: { vue: true }`
      );
      break;
    case 'react':
      options.push(`platform: 'neutral'`, `dts: true`);
      break;
    case 'svelte':
      imports.push(
        `import svelte from 'rollup-plugin-svelte'`,
        `import { sveltePreprocess } from 'svelte-preprocess'`
      );
      options.push(
        `platform: 'neutral'`,
        `plugins: [svelte({ preprocess: sveltePreprocess() })]`
      );
      break;
    default:
      options.push(`dts: true`);
      break;
  }

  return `
${imports.join('\n')}

export default defineConfig({
  ${options.join(',\n  ')}
})
`.trim();
};

export const processor: Processor = async (context) => {
  if (context.config.bundler !== 'tsdown') {
    return;
  }

  if (!context.config.mainEntryPoint) {
    return;
  }

  context.addDevDependency('tsdown', '^0.18.4');

  switch (context.config.uiFramework) {
    case 'vue':
      context.addDevDependency('unplugin-vue', '^6.2.0');
      break;
    case 'svelte':
      context.addDevDependency('rollup-plugin-svelte', '^7.2.3');
      context.addDevDependency('svelte-preprocess', '^6.0.3');
      break;
  }

  const entrypoint = context.config.mainEntryPoint;
  const lastSlash = entrypoint.lastIndexOf('/');
  const filename = entrypoint.slice(lastSlash + 1).replace(/\.ts$/, '');

  const mainField = `dist/${filename}.mjs`;

  context.emitPackageField('main', mainField);
  context.emitPackageField('exports', {
    '.': mainField
  });
  context.emitPackageField('scripts', {
    build: 'tsdown'
  });

  const config = createTsdownConfig(context);

  await context.emitFile({
    name: 'tsdown.config.ts',
    contents: config
  });
};
