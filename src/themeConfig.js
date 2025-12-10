import { reactive } from 'vue';

export const themeConfig = reactive({
  primaryColor: '#eb2186ff', // Hot Pink - customizable
  backgroundColor: '#1f1f1fff', // Dark Blue - customizable
});

// Generate lighter/darker shades from a hex color
export function generateShades(hexColor) {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Helper to adjust brightness
  const adjustBrightness = (value, percent) => {
    return Math.min(255, Math.max(0, Math.round(value + (255 - value) * percent)));
  };

  // Helper to darken
  const darken = (value, percent) => {
    return Math.max(0, Math.round(value * (1 - percent)));
  };

  // Helper to convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  return {
    lightest: rgbToHex(
      adjustBrightness(r, 0.12),
      adjustBrightness(g, 0.12),
      adjustBrightness(b, 0.12)
    ),
    lighter: rgbToHex(
      adjustBrightness(r, 0.06),
      adjustBrightness(g, 0.06),
      adjustBrightness(b, 0.06)
    ),
    base: hexColor,
    darker: rgbToHex(
      darken(r, 0.06),
      darken(g, 0.06),
      darken(b, 0.06)
    ),
    darkest: rgbToHex(
      darken(r, 0.12),
      darken(g, 0.12),
      darken(b, 0.12)
    ),
  };
}

// Get current theme colors with shades
export function getThemeColors() {
  return {
    primary: themeConfig.primaryColor,
    background: generateShades(themeConfig.backgroundColor),
  };
}

// Apply tournament colors to theme
export function applyTournamentColors(tournament) {
  if (tournament?.colors) {
    themeConfig.primaryColor = tournament.colors.primary;
    themeConfig.backgroundColor = tournament.colors.background;
  }
}

// Reset to default colors
export function resetToDefaultColors() {
  themeConfig.primaryColor = '#FF69B4';
  themeConfig.backgroundColor = '#1a1a2e';
}
