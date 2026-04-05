import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LangContext';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { lang, setLang } = useLang();

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-blob blob1" />
        <div className="login-blob blob2" />
        <div className="login-blob blob3" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">🧮</span>
          <div>
            <h1 className="logo-title">GuapoMath<span className="logo-accent">Tutor</span></h1>
            <p className="logo-sub">Pro — STAAR Ready</p>
          </div>
        </div>

        <div className="login-divider" />

        <h2 className="login-headline">
          {lang === 'en'
            ? 'AI-Powered Math Tutoring for Texas Students'
            : 'Tutoría de Matemáticas con IA para Estudiantes de Texas'}
        </h2>

        <ul className="login-features">
          <li>✦ {lang === 'en' ? 'STAAR-aligned problem bank (7th & 8th grade)' : 'Banco de problemas alineado al STAAR (7mo y 8vo)'}</li>
          <li>✦ {lang === 'en' ? 'Step-by-step AI tutor powered by Claude' : 'Tutor de IA paso a paso con Claude'}</li>
          <li>✦ {lang === 'en' ? 'Reports by TEKS, student, and class' : 'Reportes por TEKS, alumno y clase'}</li>
          <li>✦ {lang === 'en' ? 'Bilingual: English / Español' : 'Bilingüe: English / Español'}</li>
        </ul>

        <button className="btn-google" onClick={signInWithGoogle}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.6 2.4 30.1 0 24 0 14.8 0 6.9 5.4 3 13.3l7.9 6.1C12.8 13.2 18 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.1z"/>
            <path fill="#FBBC05" d="M10.9 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A24 24 0 0 0 0 24c0 3.9.9 7.5 2.4 10.7l8.5-6.1z"/>
            <path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.6-5.9c-2 1.4-4.6 2.2-7.3 2.2-6 0-11.1-4-12.9-9.4l-8 6.1C6.7 42.8 14.8 48 24 48z"/>
          </svg>
          {lang === 'en' ? 'Sign in with Google' : 'Iniciar sesión con Google'}
        </button>

        <div className="login-lang-switch">
          <button
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
          >EN</button>
          <span>|</span>
          <button
            className={lang === 'es' ? 'active' : ''}
            onClick={() => setLang('es')}
          >ES</button>
        </div>
      </div>
    </div>
  );
}
