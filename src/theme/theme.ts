/**
 * BloomDaily design theme.
 *
 * The palette is intentionally soft and warm — blush, lavender, cream, and a
 * muted sage for "done" states — with a single confident accent (bloom pink)
 * used sparingly for primary actions. Nothing here is neon or harsh; the goal
 * is a space that feels like a supportive friend, not a stern taskmaster.
 */

export const palette = {
  // Core brand
  bloom: '#F2A6C1', // primary accent — buttons, active states
  bloomDark: '#D9789F',
  bloomLight: '#FBE3EC',

  lavender: '#B9AEDF',
  lavenderLight: '#EDE9F9',

  sage: '#8FB79A',
  sageLight: '#E3F0E6',

  cream: '#FFF6F8',
  sand: '#FBF3E7',

  // Neutrals
  ink: '#2E2733',
  slate: '#6B6270',
  mist: '#A79FB0',
  fog: '#E7E1EC',
  white: '#FFFFFF',

  // Semantic
  success: '#7BAE87',
  warning: '#E0A85C',
  danger: '#DD7A7A',

  // Priority colors
  priorityHigh: '#E28A9A',
  priorityMedium: '#E0B15C',
  priorityLow: '#8FB79A',
};

export interface Theme {
  mode: 'light' | 'dark';
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

export const lightTheme: Theme = {
  mode: 'light',
  background: palette.cream,
  surface: palette.white,
  surfaceAlt: palette.sand,
  card: palette.white,
  border: palette.fog,
  textPrimary: palette.ink,
  textSecondary: palette.slate,
  textMuted: palette.mist,
  primary: palette.bloom,
  primaryDark: palette.bloomDark,
  primarySoft: palette.bloomLight,
  accent: palette.lavender,
  accentSoft: palette.lavenderLight,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  overlay: 'rgba(46, 39, 51, 0.4)',
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#1E1922',
  surface: '#2A222E',
  surfaceAlt: '#332B38',
  card: '#2A222E',
  border: '#3E3542',
  textPrimary: '#F5F0F6',
  textSecondary: '#C9BFCE',
  textMuted: '#8E8394',
  primary: palette.bloom,
  primaryDark: palette.bloomDark,
  primarySoft: '#4A3540',
  accent: palette.lavender,
  accentSoft: '#3A3450',
  success: '#8FCB9C',
  warning: '#E8BC7C',
  danger: '#E79999',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = {
  fontFamily: {
    heading: 'Poppins_600SemiBold',
    headingBold: 'Poppins_700Bold',
    body: 'Nunito_400Regular',
    bodyMedium: 'Nunito_600SemiBold',
    bodyBold: 'Nunito_700Bold',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
};

export const shadow = {
  soft: {
    shadowColor: '#4A3B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const categoryColors: Record<string, string> = {
  Study: '#B9AEDF',
  'Self-care': '#F2A6C1',
  Errands: '#E0B15C',
  Health: '#8FB79A',
  Work: '#7FA8C9',
  Social: '#E28A9A',
  Other: '#A79FB0',
};

export const moodEmojis = ['😔', '😕', '😐', '🙂', '✨'];
