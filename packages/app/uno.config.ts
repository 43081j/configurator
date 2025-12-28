import {
  defineConfig,
  presetWind4,
  presetTypography,
  presetIcons
} from 'unocss';

export default defineConfig({
  presets: [
    presetWind4(),
    presetTypography(),
    presetIcons()
  ]
});
