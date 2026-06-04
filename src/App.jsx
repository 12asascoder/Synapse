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

// Admin Screens
import AdminDashboard from './screens/AdminDashboard';
import AdminUsers from './screens/AdminUsers';
import AdminPlaceholder from './screens/AdminPlaceholder';

// Inner component that can access context
function AppRouter() {
  const { state, navigate } = useApp();
  const { currentScreen, user } = state;

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isUser = user?.role === 'USER';
  const userOnlyScreens = ['hub', 'bootcamp-init', 'dashboard', 'lesson', 'assessment', 'lesson-analytics', 'skill-passport', 'milestone', 'interview', 'analytics', 'community', 'settings'];

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
    case 'hub': return <WelcomeHub />;
    case 'bootcamp-init': return <BootcampInit />;
    case 'dashboard': return <Dashboard />;
    case 'lesson': return <LearningSession />;
    case 'assessment': return <AssessmentScreen />;
    case 'lesson-analytics': return <LessonAnalytics />;
    case 'skill-passport': return <SkillPassport />;
    case 'milestone': return <ProctoringSetup />;
    case 'interview': return <MilestoneInterview />;
    case 'analytics': return <AnalyticsCenter />;
    case 'community': return <Community />;
    case 'settings': return <Settings />;
    
    // Admin Routes
    case 'admin-dashboard': return <AdminDashboard />;
    case 'admin-users': return <AdminUsers />;
    case 'admin-bootcamps': return <AdminPlaceholder title="Bootcamp Management" description="Create and configure bootcamp programs" />;
    case 'admin-curriculum': return <AdminPlaceholder title="Curriculum Management" description="Manage learning content and AI teaching materials" />;
    case 'admin-assessments': return <AdminPlaceholder title="Assessment Management" description="Configure evaluation logic and passing scores" />;
    case 'admin-certificates': return <AdminPlaceholder title="Certificate Management" description="View and verify generated certificates" />;
    case 'admin-community': return <AdminPlaceholder title="Community Management" description="Moderate discussions and manage events" />;
    case 'admin-vishesh': return <AdminPlaceholder title="Vishesh Control Center" description="Configure AI personality and teaching style" />;
    case 'admin-analytics': return <AdminPlaceholder title="Platform Analytics" description="User growth trends and overall platform performance" />;

    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
