export const COLORS = {
  background: '#F8F9FA',
  accent: '#0D6EFD',
  textPrimary: '#212529',
  textSecondary: '#495057',
  textMuted: '#6C757D',
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  borderSubtle: '#DEE2E6',
  borderActive: '#0D6EFD',
};

export const SHARED_STYLES = {
  page: {
    background: COLORS.background,
    minHeight: '100vh',
    color: COLORS.textPrimary,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    overflowX: 'hidden',
    position: 'relative',
  },
  card: {
    background: COLORS.cardBackground,
    borderRadius: '8px',
    padding: '24px',
    border: `1px solid ${COLORS.borderSubtle}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  btnAccent: {
    background: COLORS.accent,
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '4px',
    fontFamily: 'inherit',
    transition: 'background 0.2s',
  },
  input: {
    background: COLORS.inputBackground,
    color: COLORS.textPrimary,
    border: `1px solid ${COLORS.borderSubtle}`,
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '14px',
  },
};
