// ============================================================
//  ESL MUÑOZ CONSTANZO — LoginPage.tsx
//  Rediseñado con sistema de marca oficial
// ============================================================

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLang } from "../../contexts/LangContext";

// ── Logo SVG inline ──────────────────────────────────────────
const ESLLogo = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Figura humana */}
    <circle cx="24" cy="13" r="6.5" fill="#FF6B35" />
    {/* Hoja izquierda / azul */}
    <path d="M10 28 Q5 18 15 20 Q13 25 18 28Z" fill="#0066CC" />
    {/* Hoja derecha / verde */}
    <path d="M38 28 Q43 18 33 20 Q35 25 30 28Z" fill="#2ECC71" />
    {/* Cuerpo */}
    <path
      d="M17 28 Q15 38 24 38 Q33 38 31 28 Q27 33 24 33 Q21 33 17 28Z"
      fill="#FF6B35"
    />
  </svg>
);

// ── Google icon ──────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── Tipos ────────────────────────────────────────────────────
interface Translations {
  title: string;
  subtitle: string;
  tagline: string;
  googleBtn: string;
  orDivider: string;
  footerNote: string;
  featuredTitle: string;
  features: { icon: string; title: string; desc: string }[];
  stats: { value: string; label: string }[];
}

const translations: Record<"en" | "es", Translations> = {
  es: {
    title: "ESL Muñoz Constanzo",
    subtitle: "Plataforma de tutoría matemática con IA",
    tagline: "Aprende matemáticas STAAR paso a paso, en español e inglés.",
    googleBtn: "Continuar con Google",
    orDivider: "acceso escolar",
    footerNote: "Solo para estudiantes y maestras de ESL Muñoz Constanzo",
    featuredTitle: "¿Por qué ESL Muñoz Constanzo?",
    features: [
      { icon: "🧠", title: "Tutor IA personalizado", desc: "Guía paso a paso adaptada al ritmo de cada alumno" },
      { icon: "📊", title: "Seguimiento por TEKS", desc: "Reportes detallados por estándar y por alumno" },
      { icon: "🌎", title: "Bilingüe EN / ES", desc: "Toda la plataforma disponible en español e inglés" },
      { icon: "🏆", title: "Preparación STAAR", desc: "Banco de problemas alineado a 7mo y 8vo grado" },
    ],
    stats: [
      { value: "7°–8°", label: "Grados" },
      { value: "TEKS", label: "Alineado" },
      { value: "IA", label: "Tutor" },
    ],
  },
  en: {
    title: "ESL Muñoz Constanzo",
    subtitle: "AI-powered math tutoring platform",
    tagline: "Learn STAAR math step by step, in English and Spanish.",
    googleBtn: "Continue with Google",
    orDivider: "school access",
    footerNote: "Only for ESL Muñoz Constanzo students and teachers",
    featuredTitle: "Why ESL Muñoz Constanzo?",
    features: [
      { icon: "🧠", title: "Personalized AI Tutor", desc: "Step-by-step guidance adapted to each student's pace" },
      { icon: "📊", title: "TEKS Tracking", desc: "Detailed reports by standard and by student" },
      { icon: "🌎", title: "Bilingual EN / ES", desc: "Entire platform available in English and Spanish" },
      { icon: "🏆", title: "STAAR Prep", desc: "Problem bank aligned to 7th and 8th grade" },
    ],
    stats: [
      { value: "7–8", label: "Grades" },
      { value: "TEKS", label: "Aligned" },
      { value: "AI", label: "Tutor" },
    ],
  },
};

// ── Componente principal ─────────────────────────────────────
export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { lang, setLang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const t = translations[lang as "en" | "es"] ?? translations.es;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setError(
        lang === "es"
          ? "Error al iniciar sesión. Intenta de nuevo."
          : "Sign-in failed. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>

      {/* ── Fondo decorativo ── */}
      <div style={styles.bgDecor} aria-hidden="true">
        <div style={{ ...styles.bgCircle, ...styles.bgCircle1 }} />
        <div style={{ ...styles.bgCircle, ...styles.bgCircle2 }} />
        <div style={{ ...styles.bgCircle, ...styles.bgCircle3 }} />
      </div>

      {/* ── Panel izquierdo — branding ── */}
      <aside style={styles.brandPanel}>

        {/* Lang toggle */}
        <div style={styles.langToggle}>
          <button
            style={{ ...styles.langBtn, ...(lang === "es" ? styles.langBtnActive : {}) }}
            onClick={() => setLang("es")}
          >ES</button>
          <button
            style={{ ...styles.langBtn, ...(lang === "en" ? styles.langBtnActive : {}) }}
            onClick={() => setLang("en")}
          >EN</button>
        </div>

        {/* Logo + nombre */}
        <div style={styles.brandTop}>
          <div style={styles.brandLogoWrap}>
            <ESLLogo size={56} />
          </div>
          <h1 style={styles.brandTitle}>{t.title}</h1>
          <p style={styles.brandSubtitle}>{t.subtitle}</p>
          <p style={styles.brandTagline}>{t.tagline}</p>
        </div>

        {/* Stats rápidas */}
        <div style={styles.statsRow}>
          {t.stats.map((s) => (
            <div key={s.label} style={styles.statPill}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={styles.featureList}>
          {t.features.map((f) => (
            <div key={f.title} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <div>
                <p style={styles.featureTitle}>{f.title}</p>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </aside>

      {/* ── Panel derecho — login ── */}
      <main style={styles.loginPanel}>
        <div style={styles.loginCard}>

          {/* Logo pequeño en móvil */}
          <div style={styles.mobileLogoRow}>
            <div style={styles.mobileLogoIcon}><ESLLogo size={32} /></div>
            <span style={styles.mobileLogoText}>{t.title}</span>
          </div>

          <h2 style={styles.loginTitle}>
            {lang === "es" ? "Bienvenido / Bienvenida" : "Welcome back"}
          </h2>
          <p style={styles.loginSub}>{t.footerNote}</p>

          {/* Divider */}
          <div style={styles.dividerRow}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>{t.orDivider}</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorAlert}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Botón Google */}
          <button
            style={{
              ...styles.googleBtn,
              ...(loading ? styles.googleBtnDisabled : {}),
            }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={styles.spinner} />
                {lang === "es" ? "Conectando..." : "Connecting..."}
              </>
            ) : (
              <>
                <GoogleIcon />
                {t.googleBtn}
              </>
            )}
          </button>

          {/* Nota de privacidad */}
          <p style={styles.privacyNote}>
            {lang === "es"
              ? "Al ingresar aceptas el uso de tus datos escolares para personalizar tu experiencia de aprendizaje."
              : "By signing in you agree to the use of your school data to personalize your learning experience."}
          </p>

          {/* TEKS badge decoration */}
          <div style={styles.teksDecor}>
            {["7.4A", "7.6G", "8.4B", "8.8C", "8.12D"].map((t) => (
              <span key={t} style={styles.teksPill}>{t}</span>
            ))}
          </div>

        </div>
      </main>

    </div>
  );
}

// ── Estilos inline (sin dependencia de className) ────────────
// Usan las variables CSS de styles.css a través de var()
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "var(--esl-off-white)",
    position: "relative",
    overflow: "hidden",
  },

  // Decoración de fondo
  bgDecor: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 },
  bgCircle: { position: "absolute", borderRadius: "50%", opacity: 0.06 },
  bgCircle1: {
    width: 600, height: 600,
    background: "var(--esl-orange)",
    top: -200, left: -200,
  },
  bgCircle2: {
    width: 400, height: 400,
    background: "var(--esl-blue)",
    bottom: -100, left: 180,
  },
  bgCircle3: {
    width: 300, height: 300,
    background: "var(--esl-green)",
    top: 100, right: -80,
  },

  // Panel izquierdo
  brandPanel: {
    width: 480,
    minHeight: "100vh",
    background: "linear-gradient(160deg, var(--esl-brown-dark) 0%, #3D1F09 100%)",
    padding: "40px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    position: "relative",
    zIndex: 1,
    flexShrink: 0,
  },

  langToggle: {
    display: "flex",
    gap: 4,
    alignSelf: "flex-end",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 3,
    marginBottom: 40,
  },
  langBtn: {
    padding: "4px 12px",
    borderRadius: 6,
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  langBtnActive: {
    background: "rgba(255,255,255,0.15)",
    color: "#FFFFFF",
  },

  brandTop: {
    marginBottom: 40,
  },
  brandLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    background: "rgba(255,255,255,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    border: "1px solid rgba(255,255,255,0.15)",
  },
  brandTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 28,
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
    fontWeight: 500,
  },
  brandTagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.6,
  },

  // Stats
  statsRow: {
    display: "flex",
    gap: 10,
    marginBottom: 40,
  },
  statPill: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  statValue: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--esl-orange)",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },

  // Features
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: "auto",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  featureIcon: {
    fontSize: 22,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    flexShrink: 0,
  } as React.CSSProperties,
  featureTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#FFFFFF",
    marginBottom: 2,
    fontFamily: "var(--font-display)",
  },
  featureDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.5,
  },

  // Panel derecho
  loginPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    position: "relative",
    zIndex: 1,
  },

  loginCard: {
    width: "100%",
    maxWidth: 400,
    background: "var(--esl-white)",
    borderRadius: 20,
    padding: "40px 36px",
    boxShadow: "0 8px 32px rgba(44,26,14,0.10)",
    border: "1px solid var(--esl-gray-100)",
  },

  // Logo móvil (oculto en desktop via media query — ajustar en el CSS si hace falta)
  mobileLogoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid var(--esl-gray-100)",
  },
  mobileLogoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "var(--esl-beige)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid var(--esl-beige-dark)",
  },
  mobileLogoText: {
    fontFamily: "var(--font-display)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--esl-brown-dark)",
  },

  loginTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--esl-brown-dark)",
    marginBottom: 6,
  },
  loginSub: {
    fontSize: 13,
    color: "var(--esl-text-muted)",
    marginBottom: 28,
    lineHeight: 1.5,
  },

  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "var(--esl-gray-100)",
  },
  dividerText: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--esl-text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    whiteSpace: "nowrap" as const,
  },

  // Error
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#FEF2F2",
    color: "#991B1B",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
    borderLeft: "3px solid #EF4444",
  },

  // Google button
  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "13px 20px",
    borderRadius: 12,
    border: "1px solid var(--esl-gray-200)",
    background: "var(--esl-white)",
    color: "var(--esl-text-primary)",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    transition: "all 0.15s",
    boxShadow: "0 1px 4px rgba(44,26,14,0.06)",
    marginBottom: 20,
  },
  googleBtnDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  spinner: {
    width: 18,
    height: 18,
    border: "2px solid var(--esl-gray-200)",
    borderTopColor: "var(--esl-orange)",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  privacyNote: {
    fontSize: 11,
    color: "var(--esl-text-muted)",
    textAlign: "center" as const,
    lineHeight: 1.6,
    marginBottom: 24,
  },

  // TEKS decoración
  teksDecor: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    justifyContent: "center",
    paddingTop: 16,
    borderTop: "1px solid var(--esl-gray-100)",
  },
  teksPill: {
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    color: "var(--esl-blue-dark)",
    background: "var(--esl-blue-light)",
    borderRadius: 20,
    padding: "3px 9px",
  },
};
