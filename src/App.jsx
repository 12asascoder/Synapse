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

// Inner component that can access context
function AppRouter() {
  const { state } = useApp();
  const { currentScreen } = state;

  switch (currentScreen) {
    case 'landing':
      return <LandingPage />;
    case 'loading':
      return <LoadingScreen />;
    case 'auth':
      return <AuthScreen />;
    case 'hub':
      return <WelcomeHub />;
    case 'bootcamp-init':
      return <BootcampInit />;
    case 'dashboard':
      return <Dashboard />;
    case 'lesson':
      return <LearningSession />;
    case 'assessment':
      return <AssessmentScreen />;
    case 'lesson-analytics':
      return <LessonAnalytics />;
    case 'skill-passport':
      return <SkillPassport />;
    case 'milestone':
      return <ProctoringSetup />;
    case 'interview':
      return <MilestoneInterview />;
    case 'analytics':
      return <AnalyticsCenter />;
    case 'community':
      return <Community />;
    case 'settings':
      return <Settings />;
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
