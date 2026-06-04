import AdminSidebar from '../components/AdminSidebar';

export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '28px',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: 'var(--cyan-50)',
            marginBottom: '8px'
          }}>
            Enterprise Command Center
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--cyan-400)',
            letterSpacing: '0.05em'
          }}>
            Global platform overview and real-time operations
          </p>
        </header>

        {/* Global Analytics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { label: 'Total Users', value: '14,208', trend: '+12%', color: 'var(--cyan-400)' },
            { label: 'Active Users', value: '3,842', trend: '+5%', color: 'var(--violet-400)' },
            { label: 'Bootcamp Enrollments', value: '8,901', trend: '+18%', color: 'var(--amber-400)' },
            { label: 'Completion Rate', value: '64%', trend: '+2%', color: 'var(--emerald-400)' },
            { label: 'Total Assessments', value: '45,201', trend: '+22%', color: 'var(--rose-400)' },
            { label: 'Certificates Generated', value: '5,102', trend: '+8%', color: 'var(--indigo-400)' },
            { label: 'Average Growth Score', value: '82/100', trend: '+4pts', color: 'var(--fuchsia-400)' },
            { label: 'Platform Health', value: '99.9%', trend: 'Optimal', color: 'var(--emerald-400)' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(10, 15, 25, 0.7)',
              border: `1px solid rgba(56, 189, 248, 0.15)`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                background: `linear-gradient(90deg, ${stat.color}, transparent)`
              }} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: stat.color, fontWeight: 600 }}>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px'
        }}>
          <div style={{
            background: 'rgba(10, 15, 25, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '16px',
            padding: '24px',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            [ Real-time Platform Monitoring Chart Placeholder ]
          </div>
          <div style={{
            background: 'rgba(10, 15, 25, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '16px',
            padding: '24px',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            [ Community Activity Heatmap Placeholder ]
          </div>
        </div>
      </div>
    </div>
  );
}
