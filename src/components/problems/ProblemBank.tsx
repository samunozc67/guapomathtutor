import { useState } from 'react';
import { PROBLEMS, TEKS_BY_GRADE, SUBJECTS_BY_GRADE } from '../../data/problems';
import { useLang } from '../../contexts/LangContext';
import { Problem } from '../../types';

interface ProblemBankProps {
  onNavigate: (view: string, data?: unknown) => void;
}

export default function ProblemBank({ onNavigate }: ProblemBankProps) {
  const { lang } = useLang();
  const t = (en: string, es: string) => lang === 'en' ? en : es;

  const [grade, setGrade] = useState<7 | 8>(7);
  const [subject, setSubject] = useState<string>('all');
  const [teks, setTeks] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [selected, setSelected] = useState<Problem | null>(null);

  const filtered = PROBLEMS.filter(p => {
    if (p.grade !== grade) return false;
    if (subject !== 'all' && p.subject !== subject) return false;
    if (teks !== 'all' && p.teks !== teks) return false;
    if (difficulty !== 'all' && String(p.difficulty) !== difficulty) return false;
    return true;
  });

  const diffLabel = (d: number) => ['', '⭐ Easy', '⭐⭐ Medium', '⭐⭐⭐ Hard'][d];
  const diffLabelES = (d: number) => ['', '⭐ Fácil', '⭐⭐ Medio', '⭐⭐⭐ Difícil'][d];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo"><span>🧮</span><span className="sidebar-brand">GuapoMath</span></div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => onNavigate('dashboard')}><span>📊</span> {t('Dashboard', 'Panel')}</button>
          <button className="nav-item active"><span>📝</span> {t('Problem Bank', 'Banco')}</button>
          <button className="nav-item" onClick={() => onNavigate('reports')}><span>📈</span> {t('Reports', 'Reportes')}</button>
          <button className="nav-item" onClick={() => onNavigate('tutor')}><span>🤖</span> {t('AI Tutor', 'Tutor IA')}</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="content-title">📝 {t('Problem Bank', 'Banco de Problemas')}</h1>
            <p className="content-subtitle">{t('STAAR-aligned problems by TEKS', 'Problemas alineados al STAAR por TEKS')}</p>
          </div>
        </header>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>{t('Grade', 'Grado')}</label>
            <div className="grade-toggle">
              <button className={grade === 7 ? 'active' : ''} onClick={() => { setGrade(7); setSubject('all'); setTeks('all'); }}>7th</button>
              <button className={grade === 8 ? 'active' : ''} onClick={() => { setGrade(8); setSubject('all'); setTeks('all'); }}>8th</button>
            </div>
          </div>

          <div className="filter-group">
            <label>{t('Subject', 'Materia')}</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="all">{t('All subjects', 'Todas')}</option>
              {SUBJECTS_BY_GRADE[grade].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>TEKS</label>
            <select value={teks} onChange={e => setTeks(e.target.value)}>
              <option value="all">{t('All TEKS', 'Todos los TEKS')}</option>
              {TEKS_BY_GRADE[grade].map(tk => (
                <option key={tk} value={tk}>{tk}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>{t('Difficulty', 'Dificultad')}</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="all">{t('All levels', 'Todos los niveles')}</option>
              <option value="1">{t('Easy', 'Fácil')}</option>
              <option value="2">{t('Medium', 'Medio')}</option>
              <option value="3">{t('Hard', 'Difícil')}</option>
            </select>
          </div>
        </div>

        <div className="problems-layout">
          {/* Problem List */}
          <div className="problem-list">
            <p className="result-count">{filtered.length} {t('problems found', 'problemas encontrados')}</p>
            {filtered.map(p => (
              <div
                key={p.id}
                className={`problem-card ${selected?.id === p.id ? 'selected' : ''}`}
                onClick={() => setSelected(p)}
              >
                <div className="problem-card-top">
                  <span className="teks-badge">{p.teks}</span>
                  <span className="diff-label">{lang === 'en' ? diffLabel(p.difficulty) : diffLabelES(p.difficulty)}</span>
                </div>
                <p className="problem-card-subject">{p.subject}</p>
                <p className="problem-card-question">
                  {lang === 'en' ? p.questionEN : p.questionES}
                </p>
                <button
                  className="btn-tutor-problem"
                  onClick={e => { e.stopPropagation(); onNavigate('tutor', p); }}
                >
                  🤖 {t('Practice with AI Tutor', 'Practicar con Tutor IA')}
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                <p>🔍 {t('No problems match your filters.', 'No hay problemas con esos filtros.')}</p>
              </div>
            )}
          </div>

          {/* Problem Detail */}
          {selected && (
            <div className="problem-detail">
              <div className="detail-header">
                <span className="teks-badge large">{selected.teks}</span>
                <h3>{selected.subject}</h3>
              </div>
              <p className="detail-question">
                {lang === 'en' ? selected.questionEN : selected.questionES}
              </p>
              {selected.choices && (
                <div className="detail-choices">
                  {selected.choices.map(c => (
                    <div key={c.label} className={`choice-item ${c.label === selected.answerKey ? 'correct' : ''}`}>
                      <span className="choice-label">{c.label}</span>
                      <span>{lang === 'en' ? c.textEN : c.textES}</span>
                      {c.label === selected.answerKey && <span className="correct-check">✓</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="detail-section">
                <h4>💡 {t('Hint', 'Pista')}</h4>
                <p>{lang === 'en' ? selected.hintEN : selected.hintES}</p>
              </div>
              <div className="detail-section">
                <h4>📋 {t('Solution Steps', 'Pasos de Solución')}</h4>
                <ol>
                  {(lang === 'en' ? selected.solutionStepsEN : selected.solutionStepsES).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              <button className="btn-primary" onClick={() => onNavigate('tutor', selected)}>
                🤖 {t('Practice This Problem', 'Practicar Este Problema')}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
