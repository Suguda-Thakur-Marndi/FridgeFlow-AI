/**
 * Culinary Ecology Design System Tokens
 * Directly grounded in Google Stitch export DESIGN.md
 */

export const CulinaryColors = {
  // Brand & Primaries
  primary: '#04442F', // Deep Forest Green
  primaryContainer: '#245C45',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#99D2B5',
  primaryFixed: '#B5EFD1',
  primaryFixedDim: '#99D3B6',
  onPrimaryFixedVariant: '#16503A',

  // Secondary & Accents
  secondary: '#4B6546', // Sage Green
  secondaryContainer: '#CDEBC4',
  onSecondaryContainer: '#516B4C',
  secondaryFixed: '#CDEBC4',
  secondaryFixedDim: '#B1CFA9',
  onSecondaryFixed: '#092008',

  // Tertiary & Warnings / Alerts
  tertiary: '#4D3800', // Soft Citrus
  tertiaryContainer: '#694E00',
  tertiaryFixed: '#FFDF9E',
  tertiaryFixedDim: '#F0C04F',
  onTertiaryFixed: '#261A00',
  onTertiaryFixedVariant: '#5B4300',

  // Error & Urgent Expiry
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  warningCoral: '#D96C5F',
  warningCoralText: '#9E2A1D',

  // Surfaces & Canvas
  background: '#FAF8F2', // Warm Ivory Canvas
  surface: '#F2FCF2',
  surfaceContainerLowest: '#FFFFFF', // Elevated Cards
  surfaceContainerLow: '#ECF6ED',
  surfaceContainer: '#E6F1E7',
  surfaceContainerHigh: '#E1EBE1',
  surfaceContainerHighest: '#DBE5DC',
  surfaceVariant: '#DBE5DC',

  // Typography & Neutrals
  onSurface: '#151E18', // Slate Charcoal
  onSurfaceVariant: '#404943',
  outline: '#707973',
  outlineVariant: '#C0C9C2',
  inverseSurface: '#29332C',
  inverseOnSurface: '#E9F3EA',

  // Common Convenience Aliases
  white: '#FFFFFF',
  forestGreen: '#04442F',
  sageGreen: '#4B6546',
  charcoal: '#202923',
  border: '#C0C9C2',
  mutedGrayGreen: '#707973',
} as const;

export const Colors = CulinaryColors;

export const Typography = {
  displayLg: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headlineLg: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
  },
  headlineMd: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  headlineSm: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  labelLg: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
};

export const Radii = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const BorderRadius = Radii;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  margin: 16,
};

export const Elevation = {
  level0: {
    shadowColor: 'transparent',
    elevation: 0,
  },
  level1: {
    shadowColor: '#202923',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  level2: {
    shadowColor: '#245C45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  level3: {
    shadowColor: '#202923',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};
