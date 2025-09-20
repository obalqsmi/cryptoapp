// File: src/theme.ts
export const colors = {
  background: '#050B1E',
  card: '#0B122B',
  cardElevated: '#101940',
  textPrimary: '#F5F7FF',
  textSecondary: '#9FA7C3',
  textMuted: '#6F7899',
  accent: '#3F82FF',
  success: '#25D16A',
  danger: '#FF4D67',
  border: '#1F2A4D',
  surface: '#0E1733',
  overlay: 'rgba(5, 11, 30, 0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const typography = {
  family: 'System',
  weightRegular: '400',
  weightMedium: '600',
  weightBold: '700',
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};

export type Theme = typeof theme;
