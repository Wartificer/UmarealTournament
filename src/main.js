import { createApp, watch } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { themeConfig, getThemeColors } from './themeConfig.js';

const themeColors = getThemeColors();

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: themeConfig.primaryColor,
          secondary: '#9C27B0',
          accent: '#FFD700',
          background: themeColors.background.base,
          surface: themeColors.background.lighter,
        },
      },
    },
  },
});

const app = createApp(App);
app.use(vuetify);

// Watch for theme changes and update Vuetify
watch(() => themeConfig.primaryColor, (newColor) => {
  vuetify.theme.themes.value.dark.colors.primary = newColor;
});

watch(() => themeConfig.backgroundColor, (newColor) => {
  const shades = getThemeColors();
  vuetify.theme.themes.value.dark.colors.background = shades.background.base;
  vuetify.theme.themes.value.dark.colors.surface = shades.background.lighter;
});

app.mount('#app');
