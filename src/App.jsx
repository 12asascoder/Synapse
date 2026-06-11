import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Import all screens
import LandingPage from './screens/LandingPage';
import LoadingScreen from './screens/LoadingScreen';
import AuthScreen from './screens/AuthScreen';
import WelcomeHub from './screens/WelcomeHub';
import BootcampInit from './screens/BootcampInit';
import Dashboard from './screens/Dashboard';
import LearningSession from './screens/LearningSession';
import AssessmentScreen from './screens/AssessmentScreen';
import LessonAnalytics from './screens/LessonAnalytics';
import SkillPassport from './screens/SkillPassport';
import AnalyticsCenter from './screens/AnalyticsCenter';
import Community from './screens/Community';
import Settings from './screens/Settings';
import ProctoringSetup from './screens/ProctoringSetup';
import MilestoneInterview from './screens/MilestoneInterview';
import ProfileSetup from './screens/ProfileSetup';
import InterviewPrep from './screens/InterviewPrep';
import CurriculumPlanner from './screens/CurriculumPlanner';

// Admin Screens
import AdminDashboard from './screens/AdminDashboard';
import AdminUsers from './screens/AdminUsers';
import AdminBootcamps from './screens/AdminBootcamps';
import AdminCurriculum from './screens/AdminCurriculum';
import AdminAssessments from './screens/AdminAssessments';
import AdminCertificates from './screens/AdminCertificates';
import AdminCommunity from './screens/AdminCommunity';
import AdminVishesh from './screens/AdminVishesh';
import AdminAnalytics from './screens/AdminAnalytics';

// Inner component that can access context
function AppRouter() {
  const { state, navigate } = useApp();
  const { currentScreen, user } = state;

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isUser = user?.role === 'USER';
  const userOnlyScreens = ['profile-setup', 'hub', 'bootcamp-init', 'dashboard', 'lesson', 'assessment', 'lesson-analytics', 'skill-passport', 'milestone', 'interview', 'interview-prep', 'curriculum-planner', 'analytics', 'community', 'settings'];

  useEffect(() => {
    if (isAdmin && userOnlyScreens.includes(currentScreen)) {
      navigate('admin-dashboard');
    } else if (isUser && currentScreen.startsWith('admin-')) {
      navigate('dashboard');
    }
  }, [isAdmin, isUser, currentScreen, navigate, userOnlyScreens]);

  // If redirecting, we can show loading or let it pass through (useEffect will catch it)
  
  switch (currentScreen) {
    case 'landing': return <LandingPage />;
    case 'loading': return <LoadingScreen />;
    case 'auth': return <AuthScreen />;
    
    // User Routes
    case 'profile-setup': return <ProfileSetup />;
    case 'hub': return <WelcomeHub />;
    case 'bootcamp-init': return <BootcampInit />;
    case 'dashboard': return <Dashboard />;
    case 'lesson': return <LearningSession />;
    case 'assessment': return <AssessmentScreen />;
    case 'lesson-analytics': return <LessonAnalytics />;
    case 'skill-passport': return <SkillPassport />;
    case 'milestone': return <ProctoringSetup />;
    case 'interview': return <MilestoneInterview />;
    case 'interview-prep': return <InterviewPrep />;
    case 'curriculum-planner': return <CurriculumPlanner />;
    case 'analytics': return <AnalyticsCenter />;
    case 'community': return <Community />;
    case 'settings': return <Settings />;
    
    // Admin Routes
    case 'admin-dashboard': return <AdminDashboard />;
    case 'admin-users': return <AdminUsers />;
    case 'admin-bootcamps': return <AdminBootcamps />;
    case 'admin-curriculum': return <AdminCurriculum />;
    case 'admin-assessments': return <AdminAssessments />;
    case 'admin-certificates': return <AdminCertificates />;
    case 'admin-community': return <AdminCommunity />;
    case 'admin-vishesh': return <AdminVishesh />;
    case 'admin-analytics': return <AdminAnalytics />;

    default:
      return <LandingPage />;
  }
}

import AnimatedBackground from './components/AnimatedBackground';

// Screens that manage their own backgrounds
const DARK_SCREENS = ['landing', 'loading', 'auth'];
const NO_BACK_SCREENS = ['landing', 'loading', 'auth'];

function AppWithBackground() {
  const { state, goBack } = useApp();
  const showBg = !DARK_SCREENS.includes(state.currentScreen);
  const showBack = !NO_BACK_SCREENS.includes(state.currentScreen);
  return (
    <>
      {showBg && <AnimatedBackground />}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppRouter />
        {showBack && (
          <button
            onClick={goBack}
            aria-label="Go back"
            style={{
              position: 'fixed', top: '16px', left: '16px', zIndex: 9999,
              width: 40, height: 40, borderRadius: '10px', border: '1px solid rgba(139,92,246,0.3)',
              background: 'rgba(14,14,22,0.85)', backdropFilter: 'blur(8px)',
              color: 'var(--violet-300)', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.background = 'rgba(14,14,22,0.85)'; }}
          >
            ←
          </button>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppWithBackground />
    </AppProvider>
  );
}
