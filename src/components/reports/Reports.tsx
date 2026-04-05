import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useLang } from '../../contexts/LangContext';
import { SessionRecord } from '../../types';

interface ReportsProps {
  onNavigate: (view: string) => void;
}

export default function Reports({ onNavigate }: ReportsProps) {
  const { lang } = useLang();
  const t = (en: string, es: string) => lang === 'en' ? en : es;
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'teks' | 'student' | 'course'>('teks');

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'sessions'), orderBy('completedAt', 'desc'));
        const snap = await getDocs(q);
        setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as SessionRecord)));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const byTeks = () => {
    const map: Record<string, { sessions: number; avgScore: number; scores: number[] }> = {};
    sessions.forEach(s => {
      if (!map[s.teks]) map[s.teks] = { sessions: 0, avgScore: 0, scores: [] };
      map[s.teks].sessions++;
      map[s.teks].scores.push(s.score);
    });
    Object.keys(map).forEach(k => {
      const scores = map[k].scores;
      map[k].avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });
    return map;
  };

  const byStudent = () => {
    const map: Record<string, { name: string; sessions: number; avgScore: number; scores: number[] }> = {};
    sessions.forEach(s => {
      if (!map[s.studentId]) map[s.studentId] = { name: s.studentName, sessions: 0, avgScore: 0, scores: [] };
      map[s.studentId].sessions++;
      map[s.studentId].scores.push(s.score);
    });
    Object.keys(map).forEach(k => {
      const scores = map[k].scores;
      map[k].avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });
    return map;
  };

  const teksData = byTeks();
  const studentData = byStudent();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo"><span>🧮</span><span className="sidebar-brand">GuapoMath</span></div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => onNavigate('dashboard')}><span>📊</span> {t('Dashboard', 'Panel')}</button>
          <button className="nav-item" onClick={() => onNavigate('problems')}><span>📝</span> {t('Problems', 'Banco')}</button>
          <button className="nav-item active"><span>📈</span> {t('Reports', 'Reportes')}</button>
          <button className="nav-item" onClick={() => onNavigate('tutor')}><span>🤖</span> {t('AI Tutor', 'Tutor IA')}</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="content-title">📈 {t('Reports', 'Reportes')}</h1>
            <p className="content-subtitle">{t('Progress by TEKS, student, and class', 'Progreso por TEKS, alumno y clase')}</p>
          </div>
        </header>

        <div className="report-tabs">
          <button className={view === 'teks' ? 'tab active' : 'tab'} onClick={() => setView('teks')}>
            {t('By TEKS', 'Por TEKS')}
          </button>
          <button className={view === 'student' ? 'tab active' : 'tab'} onClick={() => setView('student')}>
            {t('By Student', 'Por Alumno')}
          </button>
          <button className={view === 'course' ? 'tab active' : 'tab'} onClick={() => setView('course')}>
            {t('Recent Sessions', 'Sesiones Recientes')}
          </button>
        </div>

        {loading ? (
          <div className="loading-state">{t('Loading reports...', 'Cargando reportes...')}</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>📊 {t('No session data yet. Students need to complete AI Tutor sessions.', 'No hay datos aún. Los alumnos necesitan completar sesiones del Tutor IA.')}</p>
          </div>
        ) : (
          <div className="section-card">
            {view === 'teks' && (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TEKS</th>
                      <th>{t('Sessions', 'Sesiones')}</th>
                      <th>{t('Avg Score', 'Puntaje Prom.')}</th>
                      <th>{t('Status', 'Estado')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(teksData).sort((a, b) => a[0].localeCompare(b[0])).map(([teks, data]) => (
                      <tr key={teks}>
                        <td><span className="teks-badge">{teks}</span></td>
                        <td>{data.sessions}</td>
                        <td>
                          <div className="score-bar-container">
                            <div className="score-bar" style={{ width: `${data.avgScore}%`, background: data.avgScore >= 70 ? 'var(--accent-teal)' : 'var(--accent-rose)' }} />
                            <span>{data.avgScore}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`score-pill ${data.avgScore >= 70 ? 'pass' : 'fail'}`}>
                            {data.avgScore >= 70 ? t('On Track', 'En Camino') : t('Needs Help', 'Necesita Ayuda')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === 'student' && (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('Student', 'Alumno')}</th>
                      <th>{t('Sessions', 'Sesiones')}</th>
                      <th>{t('Avg Score', 'Puntaje Prom.')}</th>
                      <th>{t('Status', 'Estado')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(studentData).map(([id, data]) => (
                      <tr key={id}>
                        <td>{data.name}</td>
                        <td>{data.sessions}</td>
                        <td>
                          <div className="score-bar-container">
                            <div className="score-bar" style={{ width: `${data.avgScore}%`, background: data.avgScore >= 70 ? 'var(--accent-teal)' : 'var(--accent-rose)' }} />
                            <span>{data.avgScore}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`score-pill ${data.avgScore >= 70 ? 'pass' : 'fail'}`}>
                            {data.avgScore >= 70 ? t('Passing', 'Pasando') : t('At Risk', 'En Riesgo')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === 'course' && (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('Student', 'Alumno')}</th>
                      <th>TEKS</th>
                      <th>{t('Subject', 'Materia')}</th>
                      <th>{t('Score', 'Puntaje')}</th>
                      <th>{t('Problems', 'Problemas')}</th>
                      <th>{t('Date', 'Fecha')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id}>
                        <td>{s.studentName}</td>
                        <td><span className="teks-badge">{s.teks}</span></td>
                        <td>{s.subject}</td>
                        <td><span className={`score-pill ${s.score >= 70 ? 'pass' : 'fail'}`}>{s.score}%</span></td>
                        <td>{s.correctAnswers}/{s.totalProblems}</td>
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
        )}
      </main>
    </div>
  );
}
