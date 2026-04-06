import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LangContext';
import { Problem } from '../../types';
import { PROBLEMS } from '../../data/problems';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TutorProps {
  onNavigate: (view: string) => void;
  initialProblem?: Problem | null;
}

export default function AITutor({ onNavigate, initialProblem }: TutorProps) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = (en: string, es: string) => lang === 'en' ? en : es;

  const [grade, setGrade] = useState<7 | 8>(initialProblem?.grade ?? 7);
  const [problem, setProblem] = useState<Problem | null>(initialProblem ?? null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const pickRandomProblem = () => {
    const pool = PROBLEMS.filter(p => p.grade === grade);
    const p = pool[Math.floor(Math.random() * pool.length)];
    setProblem(p);
    setSelectedAnswer(null);
    setShowResult(false);
    setMessages([]);
    setSessionComplete(false);
  };

  const handleAnswer = async (choice: string) => {
    if (showResult || !problem) return;
    setSelectedAnswer(choice);
    setShowResult(true);

    const isCorrect = choice === problem.answerKey;
    const newScore = { correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 };
    setScore(newScore);

    const systemPrompt = lang === 'en'
      ? `You are GuapoMathTutor, a friendly, encouraging bilingual math tutor for Texas 7th and 8th graders. The student is working on STAAR math. The current problem is:

TEKS: ${problem.teks}
Subject: ${problem.subject}
Question: ${problem.questionEN}
Correct answer: ${problem.answerKey}
Student's answer: ${choice}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

${isCorrect
  ? 'Congratulate the student warmly and briefly explain WHY the answer is correct in 2-3 sentences. Encourage them to keep going!'
  : `Gently tell the student their answer was incorrect. The correct answer is ${problem.answerKey}. Walk through these solution steps: ${problem.solutionStepsEN.join(' → ')}. Be encouraging and patient.`}

Keep your response under 150 words. Be warm and use encouraging language. End with a question or encouragement.`
      : `Eres GuapoMathTutor, un tutor de matemáticas amigable y alentador para estudiantes de 7mo y 8vo grado en Texas. El estudiante está practicando STAAR math. El problema actual es:

TEKS: ${problem.teks}
Materia: ${problem.subject}
Pregunta: ${problem.questionES}
Respuesta correcta: ${problem.answerKey}
Respuesta del estudiante: ${choice}
Resultado: ${isCorrect ? 'CORRECTO' : 'INCORRECTO'}

${isCorrect
  ? 'Felicita al estudiante calurosamente y explica brevemente POR QUÉ la respuesta es correcta en 2-3 oraciones. ¡Anímalo a seguir!'
  : `Dile amablemente al estudiante que su respuesta fue incorrecta. La respuesta correcta es ${problem.answerKey}. Explica los pasos: ${problem.solutionStepsES.join(' → ')}. Sé alentador y paciente.`}

Mantén tu respuesta en menos de 150 palabras. Usa lenguaje cálido y alentador. Termina con una pregunta o ánimo.`;

    setAiLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: isCorrect ? 'I got it right!' : 'Help me understand.' }],
        }),
      });
      const data = await response.json();
      const aiText = data.content?.[0]?.text ?? 'Great job working through this problem!';
      setMessages([{ role: 'assistant', content: aiText }]);
    } catch {
      setMessages([{ role: 'assistant', content: isCorrect
        ? t('🎉 Correct! Great work!', '🎉 ¡Correcto! ¡Excelente trabajo!')
        : t(`The correct answer is ${problem.answerKey}. Keep practicing!`, `La respuesta correcta es ${problem.answerKey}. ¡Sigue practicando!`)
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !problem) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setAiLoading(true);

    try {
      const sysPrompt = lang === 'en'
        ? `You are GuapoMathTutor, a friendly math tutor for Texas 7th-8th graders. The student is working on TEKS ${problem.teks}: "${problem.questionEN}". Help them understand the math concept. Be concise (under 120 words), encouraging, and step-by-step when needed.`
        : `Eres GuapoMathTutor, un tutor amigable de matemáticas para estudiantes de 7mo-8vo grado en Texas. El estudiante trabaja en TEKS ${problem.teks}: "${problem.questionES}". Ayúdalo a entender el concepto. Sé conciso (menos de 120 palabras), alentador y usa pasos cuando sea necesario.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 250,
          system: sysPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const aiText = data.content?.[0]?.text ?? t('Let me help you with that!', '¡Déjame ayudarte con eso!');
      setMessages([...newMessages, { role: 'assistant', content: aiText }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: t('Sorry, I had trouble connecting. Try again!', '¡Lo siento, tuve un problema de conexión. ¡Intenta de nuevo!') }]);
    } finally {
      setAiLoading(false);
    }
  };

  const finishSession = async () => {
    if (score.total === 0) return;
    try {
      await addDoc(collection(db, 'sessions'), {
        studentId: user?.uid ?? 'demo',
        studentName: user?.displayName ?? 'Demo Student',
        course: t('7th Math', '7mo Math'),
        teks: problem?.teks ?? 'mixed',
        subject: problem?.subject ?? 'Mixed',
        grade,
        score: Math.round((score.correct / score.total) * 100),
        totalProblems: score.total,
        correctAnswers: score.correct,
        timeSpentMinutes: 10,
        completedAt: Timestamp.now(),
      });
    } catch (e) { console.error(e); }
    setSessionComplete(true);
  };

  if (sessionComplete) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo"><span>🧮</span><span className="sidebar-brand">GuapoMath</span></div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => onNavigate('dashboard')}><span>📊</span> {t('Dashboard', 'Panel')}</button>
            <button className="nav-item" onClick={() => onNavigate('problems')}><span>📝</span> {t('Problems', 'Banco')}</button>
            <button className="nav-item active"><span>🤖</span> {t('AI Tutor', 'Tutor IA')}</button>
          </nav>
        </aside>
        <main className="main-content center-content">
          <div className="session-complete-card">
            <div className="complete-icon">{pct >= 70 ? '🎉' : '💪'}</div>
            <h2>{pct >= 70 ? t('Great Job!', '¡Excelente!') : t('Keep Practicing!', '¡Sigue Practicando!')}</h2>
            <div className="score-circle">
              <span className="score-big">{pct}%</span>
              <span className="score-fraction">{score.correct}/{score.total}</span>
            </div>
            <p>{pct >= 70
              ? t('You passed this session! Your teacher can see your progress.', '¡Pasaste esta sesión! Tu maestra puede ver tu progreso.')
              : t('Good effort! Review the problems and try again.', '¡Buen esfuerzo! Repasa los problemas e intenta de nuevo.')
            }</p>
            <div className="complete-actions">
              <button className="btn-primary" onClick={() => { setScore({ correct: 0, total: 0 }); setSessionComplete(false); setProblem(null); }}>
                {t('New Session', 'Nueva Sesión')}
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('dashboard')}>
                {t('Back to Dashboard', 'Volver al Panel')}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo"><span>🧮</span><span className="sidebar-brand">GuapoMath</span></div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => onNavigate('dashboard')}><span>📊</span> {t('Dashboard', 'Panel')}</button>
          <button className="nav-item" onClick={() => onNavigate('problems')}><span>📝</span> {t('Problems', 'Banco')}</button>
          <button className="nav-item active"><span>🤖</span> {t('AI Tutor', 'Tutor IA')}</button>
          <button className="nav-item" onClick={() => onNavigate('reports')}><span>📈</span> {t('Reports', 'Reportes')}</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="session-score-sidebar">
            <p>{t('Score', 'Puntaje')}: <strong>{score.correct}/{score.total}</strong></p>
            {score.total > 0 && (
              <button className="btn-finish" onClick={finishSession}>
                {t('Finish Session', 'Terminar Sesión')}
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="content-title">🤖 {t('AI Math Tutor', 'Tutor de Matemáticas IA')}</h1>
            <p className="content-subtitle">{t('Powered by Claude · Step-by-step help', 'Desarrollado con Claude · Ayuda paso a paso')}</p>
          </div>
        </header>

        {!problem ? (
          <div className="tutor-setup">
            <div className="setup-card">
              <h2>{t('Choose Your Practice', 'Elige tu Práctica')}</h2>
              <div className="setup-grade">
                <label>{t('Grade Level', 'Nivel de Grado')}</label>
                <div className="grade-toggle large">
                  <button className={grade === 7 ? 'active' : ''} onClick={() => setGrade(7)}>7th Grade</button>
                  <button className={grade === 8 ? 'active' : ''} onClick={() => setGrade(8)}>8th Grade</button>
                </div>
              </div>
              <button className="btn-primary large" onClick={pickRandomProblem}>
                {t('Start Tutor Session →', 'Iniciar Sesión de Tutor →')}
              </button>
            </div>
          </div>
        ) : (
          <div className="tutor-layout">
            {/* Problem Panel */}
            <div className="problem-panel">
              <div className="problem-header">
                <span className="teks-badge">{problem.teks}</span>
                <span className="problem-subject">{problem.subject}</span>
                <button className="btn-next-problem" onClick={pickRandomProblem}>
                  {t('Next Problem →', 'Siguiente Problema →')}
                </button>
              </div>

              <p className="problem-question">
                {lang === 'en' ? problem.questionEN : problem.questionES}
              </p>

              {problem.choices && (
                <div className="choices-grid">
                  {problem.choices.map(c => {
                    let cls = 'choice-btn';
                    if (showResult) {
                      if (c.label === problem.answerKey) cls += ' correct';
                      else if (c.label === selectedAnswer) cls += ' wrong';
                    }
                    return (
                      <button
                        key={c.label}
                        className={cls}
                        onClick={() => handleAnswer(c.label)}
                        disabled={showResult}
                      >
                        <span className="choice-letter">{c.label}</span>
                        <span>{lang === 'en' ? c.textEN : c.textES}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {showResult && (
                <div className={`result-banner ${selectedAnswer === problem.answerKey ? 'correct' : 'incorrect'}`}>
                  {selectedAnswer === problem.answerKey
                    ? t('✓ Correct!', '✓ ¡Correcto!')
                    : t(`✗ The answer is ${problem.answerKey}`, `✗ La respuesta es ${problem.answerKey}`)}
                </div>
              )}
            </div>

            {/* Chat Panel */}
            <div className="chat-panel">
              <div className="chat-header">
                <span className="chat-avatar">🤖</span>
                <div>
                  <p className="chat-name">GuapoMathTutor</p>
                  <p className="chat-powered">{t('Powered by Claude', 'Desarrollado con Claude')}</p>
                </div>
              </div>

              <div className="chat-messages" ref={chatRef}>
                {messages.length === 0 && !aiLoading && (
                  <div className="chat-empty">
                    <p>👋 {t('Answer a question to get started!', '¡Responde una pregunta para comenzar!')}</p>
                    <p className="chat-hint">{t('I\'ll give you step-by-step feedback and answer your questions.', 'Te daré retroalimentación paso a paso y responderé tus preguntas.')}</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`message ${m.role}`}>
                    {m.role === 'assistant' && <span className="msg-avatar">🤖</span>}
                    <div className="message-bubble">{m.content}</div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="message assistant">
                    <span className="msg-avatar">🤖</span>
                    <div className="message-bubble typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-input-area">
                <input
                  className="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={t('Ask me anything about this problem...', 'Pregúntame cualquier cosa sobre este problema...')}
                />
                <button className="chat-send" onClick={sendMessage} disabled={aiLoading}>
                  {t('Send', 'Enviar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
