export const colors = {
  brand: {
    primary:     '#0D9488',
    primaryDark: '#0F766E',
    soft:        '#CCFBF1',
  },

  neutral: {
    text:      '#18181B',
    secondary: '#71717A',
    border:    '#E4E4E7',
    surface:   '#F4F4F5',
    background: '#FFFFFF',
  },

  table: {
    free:           { text: '#16A34A', bg: '#DCFCE7' },
    occupied:       { text: '#2563EB', bg: '#DBEAFE' },
    pendingPayment: { text: '#F59E0B', bg: '#FEF3C7' },
  },

  feedback: {
    success: '#16A34A',
    error:   '#DC2626',
    info:    '#2563EB',
  },

  area: {
    comedor: { text: '#475569', bg: '#F1F5F9' },
    bar:     { text: '#7E22CE', bg: '#F3E8FF' },
  },

  category: {
    palette:  ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'],
    fallback: '#9CA3AF',
  },
} as const
