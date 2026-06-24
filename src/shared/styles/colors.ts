export const colors = {
  brand: {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    soft: '#CCFBF1',
  },

  neutral: {
    text: '#18181B',
    textStrong: '#111827',
    textMedium: '#374151',
    secondary: '#6B7280',
    mutedText: '#6B7280',
    muted: '#9CA3AF',
    border: '#E5E7EB',
    borderSubtle: '#F3F4F6',
    surface: '#F9FAFB',
    background: '#FFFFFF',
    overlay: 'rgba(17, 24, 39, 0.45)',
  },

  table: {
    free: { text: '#16A34A', bg: '#DCFCE7' },
    occupied: { text: '#2563EB', bg: '#DBEAFE' },
    pendingPayment: { text: '#F59E0B', bg: '#FEF3C7' },
  },

  feedback: {
    success: '#16A34A',
    error: '#DC2626',
    errorDark: '#991B1B',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    info: '#2563EB',
    infoDark: '#1D4ED8',
    infoBg: '#EFF6FF',
    infoBorder: '#BFDBFE',
    warningText: '#854D0E',
    warningBg: '#FEFCE8',
    warningBorder: '#FDE047',
  },

  area: {
    comedor: { text: '#475569', bg: '#F1F5F9' },
    bar: { text: '#7E22CE', bg: '#F3E8FF' },
  },

  badge: {
    amber: { text: '#7A560A', bg: '#FEF3CD' },
  },

  category: {
    palette: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'],
    fallback: '#9CA3AF',
  },
} as const;
