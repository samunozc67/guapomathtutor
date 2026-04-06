import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLang } from './contexts/LangContext';
import LoginPage from './components/auth/LoginPage';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import ProblemBank from './components/problems/ProblemBank';
import AITutor from './components/tutor/AITutor';
import Reports from './components/reports/Reports';
import { Problem } from './types';

type View = 'dashboard' | 'problems' | 'tutor' | 'reports';

export default function App() {
  const { user, loading } = useAuth();
  const { lang } = useLang();
  const [view, setView] = useState<View>('dashboard');
  const [tutorProblem, setTutorProblem] = useState<Problem | null>(null);

  const navigate = (v: string, data?: unknown) => {
    setView(v as View);
    if (v === 'tutor' && data) {
      setTutorProblem(data as Problem);
    } else if (v !== 'tutor') {
      setTutorProblem(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <span>🧮</span>
          <p>{lang === 'en' ? 'Loading...' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <>
      {view === 'dashboard' && <TeacherDashboard onNavigate={navigate} />}
      {view === 'problems' && <ProblemBank onNavigate={navigate} />}
      {view === 'tutor' && <AITutor onNavigate={navigate} initialProblem={tutorProblem} />}
      {view === 'reports' && <Reports onNavigate={navigate} />}
    </>
  );
}
