import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LangContext';
import { SessionRecord } from '../../types';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function TeacherDashboard({ onNavigate }: DashboardProps) {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState({ totalSessions: 0, avgScore: 0, activeStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const q = query(
        collection(db, 'sessions'),
        orderBy('completedAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as SessionRecord));
      setSessions(data);

      if (data.length > 0) {
        const avg = data.reduce((s, r) => s + r.score, 0) / data.length;
        const uniqueStudents = new Set(data.map(d => d.studentId)).size;
        setStats({ totalSessions: data.length, avgScore: Math.round(avg), activeStudents: uniqueStudents });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const t = (en: string, es: string) => lang === 'en' ? en : es;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>🧮</span>
          <span className="sidebar-brand">GuapoMath</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => onNavigate('dashboard')}>
            <span>📊</span> {t('Dashboard', 'Panel')}
          </button>
          <button className="nav-item" onClick={() => onNavigate('problems')}>
            <span>📝</span> {t('Problem Bank', 'Banco')}
          </button>
          <button className="nav-item" onClick={() => onNavigate('reports')}>
            <span>📈</span> {t('Reports', 'Reportes')}
          </button>
          <button className="nav-item" onClick={() => onNavigate('tutor')}>
            <span>🤖</span> {t('AI Tutor Demo', 'Demo IA')}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
          </div>
          <div className="user-info">
            {user?.photoURL && <img src={user.photoURL} className="user-avatar" alt="avatar" />}
            <div>
              <p className="user-name">{user?.displayName}</p>
              <p className="user-role">{t('Teacher', 'Maestra/o')}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>{t('Sign out', 'Salir')}</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="content-title">
              {t(`Welcome back, ${user?.displayName?.split(' ')[0]}! 👋`, `¡Bienvenida/o, ${user?.displayName?.split(' ')[0]}! 👋`)}
            </h1>
            <p className="content-subtitle">
              {t('STAAR Math Tutor — 7th & 8th Grade Texas', 'Tutor STAAR Math — 7mo y 8vo Grado Texas')}
            </p>
          </div>
        </header>

        {/* Stats cards */}
        <div className="stats-grid">
          <div className="stat-card stat-purple">
            <p className="stat-label">{t('Total Sessions', 'Sesiones Totales')}</p>
            <p className="stat-value">{loading ? '—' : stats.totalSessions}</p>
            <p className="stat-sub">{t('all time', 'en total')}</p>
          </div>
          <div className="stat-card stat-teal">
            <p className="stat-label">{t('Avg Score', 'Puntaje Promedio')}</p>
            <p className="stat-value">{loading ? '—' : `${stats.avgScore}%`}</p>
            <p className="stat-sub">{t('across students', 'entre alumnos')}</p>
          </div>
          <div className="stat-card stat-amber">
            <p className="stat-label">{t('Active Students', 'Alumnos Activos')}</p>
            <p className="stat-value">{loading ? '—' : stats.activeStudents}</p>
            <p className="stat-sub">{t('this period', 'este periodo')}</p>
          </div>
          <div className="stat-card stat-rose">
            <p className="stat-label">{t('Grade Levels', 'Grados')}</p>
            <p className="stat-value">7 & 8</p>
            <p className="stat-sub">Texas STAAR</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-card">
          <h2 className="section-title">{t('Quick Actions', 'Acciones Rápidas')}</h2>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => onNavigate('tutor')}>
              <span className="action-icon">🤖</span>
              <span className="action-label">{t('Start AI Tutor Session', 'Iniciar Sesión de Tutor IA')}</span>
            </button>
            <button className="action-btn" onClick={() => onNavigate('problems')}>
              <span className="action-icon">📝</span>
              <span className="action-label">{t('Browse Problem Bank', 'Ver Banco de Problemas')}</span>
            </button>
            <button className="action-btn" onClick={() => onNavigate('reports')}>
              <span className="action-icon">📈</span>
              <span className="action-label">{t('View Reports', 'Ver Reportes')}</span>
            </button>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="section-card">
          <h2 className="section-title">{t('Recent Sessions', 'Sesiones Recientes')}</h2>
          {loading ? (
            <div className="loading-state">{t('Loading...', 'Cargando...')}</div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <p>🎯 {t('No sessions yet. Share the student link to get started!', '¡No hay sesiones. Comparte el enlace con tus alumnos!')}</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('Student', 'Alumno')}</th>
                    <th>TEKS</th>
                    <th>{t('Subject', 'Materia')}</th>
                    <th>{t('Score', 'Puntaje')}</th>
                    <th>{t('Date', 'Fecha')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.studentName}</td>
                      <td><span className="teks-badge">{s.teks}</span></td>
                      <td>{s.subject}</td>
                      <td>
                        <span className={`score-pill ${s.score >= 70 ? 'pass' : 'fail'}`}>
                          {s.score}%
                        </span>
                      </td>
                      <td>{s.completedAt instanceof Date
                        ? s.completedAt.toLocaleDateString()
                        : new Date((s.completedAt as any).seconds * 1000).toLocaleDateString()
                      }</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
