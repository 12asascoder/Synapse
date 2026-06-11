import CustomCursor from './CustomCursor';

const containerStyle = {
  minHeight: '100vh',
  background: '#010203',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  color: '#f3f2ee',
};

export default function ThemeContainer({ children }) {
  return (
    <div style={containerStyle}>
      {children}
      <CustomCursor />
    </div>
  );
}
