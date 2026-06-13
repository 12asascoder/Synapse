// Custom cursor removed

const containerStyle = {
  minHeight: '100vh',
  background: 'var(--bg-base)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  color: 'var(--text-primary)',
};

export default function ThemeContainer({ children }) {
  return (
    <div style={containerStyle}>
      {children}

    </div>
  );
}
