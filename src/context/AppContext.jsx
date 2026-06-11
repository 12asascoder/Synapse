/**
 * Synapse — Application State Management
 * Central context for user session, bootcamp progress, and Vishesh state
 */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'synapse_session_v1';

const initialState = {
  // Navigation stack for internal back navigation
  navigationStack: [],
  // Auth
  user: null,
  isAuthenticated: false,
  // Bootcamp
  selectedBootcamp: null,
  currentDay: 1,
  completedDays: [],
  completedLessons: [],
  completedAssessments: [],
  // Analytics
  scores: {
    knowledge: 0,
    accuracy: 0,
    confidence: 0,
    retention: 0,
    velocity: 0,
    communication: 0,
    technical: 0,
    problemSolving: 0,
  },
  streak: 0,
  totalPoints: 0,
  growthScore: 0,
  // UI
  currentScreen: 'loading', // loading | landing | auth | hub | bootcamp-init | dashboard | lesson | assessment | analytics | skill-passport | community | certificates | settings | milestone | results
  sidebarOpen: true,
  // Messages history for Vishesh
  messageHistory: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'PUSH_SCREEN':
      return { ...state, navigationStack: [...state.navigationStack, action.payload] };
    case 'POP_SCREEN': {
      const newStack = state.navigationStack.slice(0, -1);
      const newScreen = newStack.length ? newStack[newStack.length - 1] : 'landing';
      return { ...state, navigationStack: newStack, currentScreen: newScreen };
    }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'LOGOUT':
      // Clear all client-side state on logout
      return { ...initialState, currentScreen: 'landing' };
    case 'SELECT_BOOTCAMP':
      return { ...state, selectedBootcamp: action.payload };
    case 'START_BOOTCAMP':
      return { ...state, currentDay: 1, completedDays: [], completedLessons: [], streak: 0 };
    case 'COMPLETE_LESSON':
      return {
        ...state,
        completedLessons: [...new Set([...state.completedLessons, action.payload])],
      };
    case 'COMPLETE_ASSESSMENT': {
      const { day, scores } = action.payload;
      const newScores = { ...state.scores };
      Object.entries(scores).forEach(([k, v]) => {
        newScores[k] = Math.round((newScores[k] + v) / 2);
      });
      const completedDays = [...new Set([...state.completedDays, day])];
      return {
        ...state,
        completedAssessments: [...new Set([...state.completedAssessments, day])],
        completedDays,
        currentDay: Math.max(state.currentDay, day + 1),
        streak: state.streak + 1,
        totalPoints: state.totalPoints + Math.round(scores.knowledge || 0) * 5,
        growthScore: Math.min(100, state.growthScore + 3),
        scores: newScores,
      };
    }
    case 'UPDATE_SCORES':
      return { ...state, scores: { ...state.scores, ...action.payload } };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messageHistory: [...state.messageHistory.slice(-50), action.payload],
      };
    case 'CLEAR_MESSAGES':
      return { ...state, messageHistory: [] };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'FETCH_PROGRESS_SUCCESS':
      return {
        ...state,
        currentDay: action.payload.currentDay,
        streak: action.payload.streak,
        growthScore: action.payload.growthScore,
        scores: {
          knowledge: action.payload.knowledgeScore || 0,
          velocity: action.payload.velocityScore || 0,
          technical: action.payload.technicalScore || 0,
          communication: action.payload.communicationScore || 0,
          problemSolving: action.payload.problemSolvingScore || 0,
          consistency: action.payload.consistencyScore || 0,
          retention: action.payload.retentionScore || 0,
        },
        progressHistory: action.payload.history || [],
      };
    case 'RESTORE_SESSION':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore session from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({
          type: 'RESTORE_SESSION',
          payload: {
            user: parsed.user,
            isAuthenticated: !!parsed.user,
            selectedBootcamp: parsed.selectedBootcamp,
            currentDay: parsed.currentDay || 1,
            completedDays: parsed.completedDays || [],
            completedLessons: parsed.completedLessons || [],
            completedAssessments: parsed.completedAssessments || [],
            scores: parsed.scores || initialState.scores,
            streak: parsed.streak || 0,
            totalPoints: parsed.totalPoints || 0,
            growthScore: parsed.growthScore || 0,
            progressHistory: parsed.progressHistory || [],
            currentScreen: parsed.isAuthenticated ? (parsed.user?.role === 'SUPER_ADMIN' ? 'admin-dashboard' : (parsed.selectedBootcamp ? 'dashboard' : 'hub')) : 'landing',
          },
        });
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch real progress from backend when authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user?.id) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/progress/${state.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            dispatch({ type: 'FETCH_PROGRESS_SUCCESS', payload: data });
          }
        })
        .catch(err => console.error("Failed to fetch progress", err));
    }
  }, [state.isAuthenticated, state.user]);

  // Persist session state (non-sensitive only)
  useEffect(() => {
    if (state.isAuthenticated) {
      try {
        const toSave = {
          user: { name: state.user?.name, email: state.user?.email, role: state.user?.role },
          isAuthenticated: state.isAuthenticated,
          selectedBootcamp: state.selectedBootcamp,
          currentDay: state.currentDay,
          completedDays: state.completedDays,
          completedLessons: state.completedLessons,
          completedAssessments: state.completedAssessments,
          scores: state.scores,
          streak: state.streak,
          totalPoints: state.totalPoints,
          growthScore: state.growthScore,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        // Storage quota exceeded or private mode — fail silently
      }
    }
  }, [state.isAuthenticated, state.selectedBootcamp, state.currentDay, state.completedDays, state.scores]);

  const navigate = useCallback((screen) => {
    // Update URL without reloading and push to navigation stack
    const path = `/${screen}`;
    window.history.pushState({}, '', path);
    dispatch({ type: 'PUSH_SCREEN', payload: screen });
    dispatch({ type: 'SET_SCREEN', payload: screen });
  }, []);

  const goBack = useCallback(() => {
    const newStack = state.navigationStack.slice(0, -1);
    const newScreen = newStack.length ? newStack[newStack.length - 1] : 'landing';
    dispatch({ type: 'POP_SCREEN' });
    // Replace URL to reflect the new screen without adding to history
    window.history.replaceState({}, '', `/${newScreen}`);
  }, [state.navigationStack]);

  // Set initial history
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', '/landing');
    }
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const screen = window.location.pathname.replace(/^\//, '') || 'landing';
      dispatch({ type: 'SET_SCREEN', payload: screen });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
    // Full page state clear
    window.history.pushState({}, '', '/');
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, navigate, goBack, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
