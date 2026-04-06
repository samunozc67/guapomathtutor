// ============================================================
//  ESL MUÑOZ CONSTANZO — AITutor.tsx
//  Rediseñado con sistema de marca oficial
// ============================================================

import { useState, useRef, useEffect } from "react";
import { useLang } from "../../contexts/LangContext";
import { useAuth } from "../../contexts/AuthContext";
import type { Problem } from "../../types/index";

// ── Tipos ────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "tutor" | "user";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface Step {
  number: number;
  title: string;
  content: string;
  done: boolean;
}

// ── Logo SVG ─────────────────────────────────────────────────
const ESLLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="13" r="6.5" fill="#FF6B35" />
    <path d="M10 28 Q5 18 15 20 Q13 25 18 28Z" fill="#0066CC" />
    <path d="M38 28 Q43 18 33 20 Q35 25 30 28Z" fill="#2ECC71" />
    <path d="M17 28 Q15 38 24 38 Q33 38 31 28 Q27 33 24 33 Q21 33 17 28Z" fill="#FF6B35" />
  </svg>
);

// ── Traducciones ─────────────────────────────────────────────
const tr = {
  es: {
    title: "Tutor IA",
    subtitle: "Aprende paso a paso con inteligencia artificial",
    tutorName: "Tutor ESL",
    welcomeMsg: "¡Hola! Soy tu tutor de matemáticas. Puedo ayudarte a resolver problemas STAAR paso a paso. ¿Con qué problema necesitas ayuda hoy?",
    inputPlaceholder: "Escribe tu pregunta o pega un problema...",
    send: "Enviar",
    newChat: "Nueva sesión",
    loadingMsg: "El tutor está pensando...",
    you: "Tú",
    steps: "Pasos de solución",
    stepsDesc: "Sigue cada paso para entender la solución",
    noSteps: "El tutor generará los pasos al resolver un problema.",
    suggestions: [
      "¿Cómo resuelvo una ecuación lineal?",
      "Explícame el teorema de Pitágoras",
      "¿Qué es la probabilidad?",
      "¿Cómo calculo la pendiente de una recta?",
    ],
    problemLoaded: (teks: string) => `Problema cargado (${teks}). ¡Empecemos!`,
    errorMsg: "Hubo un error al conectar con el tutor. Intenta de nuevo.",
    copyBtn: "Copiar",
    copied: "¡Copiado!",
    clearChat: "Limpiar chat",
    thinking: "Pensando",
  },
  en: {
    title: "AI Tutor",
    subtitle: "Learn step by step with artificial intelligence",
    tutorName: "ESL Tutor",
    welcomeMsg: "Hi! I'm your math tutor. I can help you solve STAAR problems step by step. What problem do you need help with today?",
    inputPlaceholder: "Type your question or paste a problem...",
    send: "Send",
    newChat: "New session",
    loadingMsg: "Tutor is thinking...",
    you: "You",
    steps: "Solution steps",
    stepsDesc: "Follow each step to understand the solution",
    noSteps: "The tutor will generate steps when solving a problem.",
    suggestions: [
      "How do I solve a linear equation?",
      "Explain the Pythagorean theorem",
      "What is probability?",
      "How do I calculate the slope of a line?",
    ],
    problemLoaded: (teks: string) => `Problem loaded (${teks}). Let's get started!`,
    errorMsg: "There was an error connecting to the tutor. Please try again.",
    copyBtn: "Copy",
    copied: "Copied!",
    clearChat: "Clear chat",
    thinking: "Thinking",
  },
};

// ── Parse steps from Claude response ─────────────────────────
function parseSteps(text: string): Step[] {
  const stepRegex = /(?:paso|step)\s*(\d+)[:\.]?\s*([^\n]+)/gi;
  const steps: Step[] = [];
  let match;
  while ((match = stepRegex.exec(text)) !== null) {
    steps.push({
      number: parseInt(match[1]),
      title: match[2].trim(),
      content: match[2].trim(),
      done: false,
    });
  }
  return steps;
}

// ── Typing dots animation ─────────────────────────────────────
function TypingDots({ label }: { label: string }) {
  return (
    <div style={dotStyles.wrap}>
      <div style={dotStyles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              ...dotStyles.dot,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
      <span style={dotStyles.label}>{label}</span>
    </div>
  );
}

const dotStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 0 2px",
  },
  dotsRow: { display: "flex", gap: 4 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--esl-orange)",
    animation: "esl-bounce 1.0s ease-in-out infinite",
  },
  label: {
    fontSize: 12,
    color: "var(--esl-text-muted)",
    fontStyle: "italic",
  },
};

// ── Message bubble ────────────────────────────────────────────
function MessageBubble({
  msg,
  tutorName,
  youLabel,
}: {
  msg: Message;
  tutorName: string;
  youLabel: string;
}) {
  const isTutor = msg.role === "tutor";

  // Format markdown-lite: bold **text**, bullet lists, paso/step
  const formatContent = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        // Bold
        const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        // Bullet
        const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
        // Step header
        const isStep = /^(paso|step)\s*\d+/i.test(line.trim());

        if (isStep) {
          return (
            <div
              key={i}
              style={mb.stepLine}
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        }
        if (isBullet) {
          return (
            <div key={i} style={mb.bulletLine}>
              <span style={mb.bulletDot}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s*/, "") }} />
            </div>
          );
        }
        return (
          <p
            key={i}
            style={mb.textLine}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      });
  };

  return (
    <div style={{ ...mb.wrap, ...(isTutor ? mb.wrapTutor : mb.wrapUser) }}>
      {/* Avatar */}
      {isTutor && (
        <div style={mb.tutorAvatar}>
          <ESLLogo size={20} />
        </div>
      )}

      <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Name + time */}
        <div style={{ ...mb.meta, ...(isTutor ? {} : { justifyContent: "flex-end" }) }}>
          <span style={mb.sender}>{isTutor ? tutorName : youLabel}</span>
          <span style={mb.time}>
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Bubble */}
        <div style={isTutor ? mb.tutorBubble : mb.userBubble}>
          {msg.isLoading ? (
            <TypingDots label="" />
          ) : (
            <div style={mb.content}>{formatContent(msg.content)}</div>
          )}
        </div>
      </div>

      {/* User avatar */}
      {!isTutor && (
        <div style={mb.userAvatar}>U</div>
      )}
    </div>
  );
}

const mb: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "4px 0",
  },
  wrapTutor: { flexDirection: "row" },
  wrapUser:  { flexDirection: "row-reverse" },
  tutorAvatar: {
    width: 34, height: 34,
    borderRadius: "50%",
    background: "var(--esl-beige)",
    border: "1.5px solid var(--esl-beige-dark)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 18,
  },
  userAvatar: {
    width: 34, height: 34,
    borderRadius: "50%",
    background: "var(--esl-blue-light)",
    color: "var(--esl-blue-dark)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 18,
    fontFamily: "var(--font-display)",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  sender: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--esl-text-secondary)",
  },
  time: {
    fontSize: 10,
    color: "var(--esl-text-muted)",
  },
  tutorBubble: {
    background: "var(--esl-beige)",
    borderRadius: "0 14px 14px 14px",
    padding: "12px 16px",
    borderLeft: "3px solid var(--esl-orange)",
  },
  userBubble: {
    background: "var(--esl-blue)",
    borderRadius: "14px 0 14px 14px",
    padding: "12px 16px",
  },
  content: { display: "flex", flexDirection: "column", gap: 4 },
  textLine: {
    fontSize: 14,
    lineHeight: 1.65,
    color: "var(--esl-brown-dark)",
    margin: 0,
  },
  stepLine: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--esl-orange-dark)",
    padding: "4px 0 2px",
    fontFamily: "var(--font-display)",
  },
  bulletLine: {
    display: "flex",
    gap: 6,
    fontSize: 14,
    color: "var(--esl-brown-dark)",
    lineHeight: 1.5,
    alignItems: "flex-start",
  },
  bulletDot: {
    color: "var(--esl-orange)",
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },
};

// ── Step panel ────────────────────────────────────────────────
function StepPanel({ steps, title, desc, noSteps }: {
  steps: Step[];
  title: string;
  desc: string;
  noSteps: string;
}) {
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});

  const toggle = (n: number) =>
    setDoneMap((prev) => ({ ...prev, [n]: !prev[n] }));

  return (
    <div style={sp.panel}>
      <div style={sp.header}>
        <div style={sp.title}>{title}</div>
        <div style={sp.desc}>{desc}</div>
      </div>
      {steps.length === 0 ? (
        <div style={sp.empty}>
          <span style={{ fontSize: 32 }}>🧮</span>
          <p style={sp.emptyText}>{noSteps}</p>
        </div>
      ) : (
        <div style={sp.list}>
          {steps.map((step) => {
            const done = doneMap[step.number];
            return (
              <div
                key={step.number}
                style={{ ...sp.step, ...(done ? sp.stepDone : {}) }}
                onClick={() => toggle(step.number)}
              >
                <div style={{ ...sp.stepNum, ...(done ? sp.stepNumDone : {}) }}>
                  {done ? "✓" : step.number}
                </div>
                <div style={sp.stepContent}>
                  <div style={sp.stepTitle}>{step.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const sp: Record<string, React.CSSProperties> = {
  panel: {
    width: 260,
    background: "var(--esl-white)",
    borderLeft: "1px solid var(--esl-gray-100)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  header: {
    padding: "18px 16px 14px",
    borderBottom: "1px solid var(--esl-gray-100)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--esl-brown-dark)",
    marginBottom: 3,
  },
  desc: {
    fontSize: 11,
    color: "var(--esl-text-muted)",
    lineHeight: 1.5,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    padding: "12px 12px",
    overflowY: "auto",
    flex: 1,
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.12s",
    marginBottom: 4,
  },
  stepDone: {
    background: "var(--esl-green-muted)",
  },
  stepNum: {
    width: 24, height: 24,
    borderRadius: "50%",
    background: "var(--esl-orange-light)",
    color: "var(--esl-orange-dark)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: "var(--font-display)",
    transition: "all 0.15s",
  },
  stepNumDone: {
    background: "var(--esl-green)",
    color: "var(--esl-white)",
  },
  stepContent: { flex: 1, paddingTop: 2 },
  stepTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--esl-brown-dark)",
    lineHeight: 1.5,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: 12,
    flex: 1,
  },
  emptyText: {
    fontSize: 12,
    color: "var(--esl-text-muted)",
    textAlign: "center",
    lineHeight: 1.6,
  },
};

// ── Componente principal ─────────────────────────────────────
export default function AITutor({
  initialProblem,
}: {
  initialProblem?: Problem;
}) {
  const { lang } = useLang();
  const { user } = useAuth();
  const locale = (lang as "es" | "en") ?? "es";
  const t = tr[locale];

  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [steps, setSteps]         = useState<Step[]>([]);
  const [showSteps, setShowSteps] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  // Welcome message
  useEffect(() => {
    const welcome: Message = {
      id: "welcome",
      role: "tutor",
      content: t.welcomeMsg,
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, [locale]);

  // Load initial problem from ProblemBank
  useEffect(() => {
    if (!initialProblem) return;
    const msg: Message = {
      id: `init-${Date.now()}`,
      role: "user",
      content: initialProblem.question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    sendToTutor(initialProblem.question, [...messages, msg]);
  }, [initialProblem]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Llamada a Claude API ─────────────────────────────────
  const sendToTutor = async (userMsg: string, history: Message[]) => {
    setLoading(true);

    const loadingMsg: Message = {
      id: `loading-${Date.now()}`,
      role: "tutor",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMsg]);

    const systemPrompt = locale === "es"
      ? `Eres un tutor de matemáticas amable y paciente para estudiantes de 7mo y 8vo grado de ESL Muñoz Constanzo. 
         Explica cada problema STAAR paso a paso (usa "Paso 1:", "Paso 2:", etc.). 
         Usa lenguaje simple y animador. Responde en español a menos que el alumno escriba en inglés.
         Cuando sea posible, conecta los conceptos con los TEKS de Texas.
         Sé breve pero claro. Usa emojis con moderación para hacer la explicación más amigable.`
      : `You are a kind and patient math tutor for 7th and 8th grade students at ESL Muñoz Constanzo.
         Explain each STAAR problem step by step (use "Step 1:", "Step 2:", etc.).
         Use simple, encouraging language. Respond in English unless the student writes in Spanish.
         When possible, connect concepts to Texas TEKS standards.
         Be concise but clear. Use emojis sparingly to make explanations friendly.`;

    // Build conversation history for API
    const apiMessages = history
      .filter((m) => !m.isLoading)
      .map((m) => ({
        role: m.role === "tutor" ? "assistant" : "user",
        content: m.content,
      }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content
        ?.map((c: { type: string; text?: string }) => (c.type === "text" ? c.text : ""))
        .filter(Boolean)
        .join("\n") ?? t.errorMsg;

      // Extract steps
      const parsedSteps = parseSteps(reply);
      if (parsedSteps.length > 0) setSteps(parsedSteps);

      const tutorMsg: Message = {
        id: `tutor-${Date.now()}`,
        role: "tutor",
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(tutorMsg));
    } catch {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: "tutor",
        content: t.errorMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    inputRef.current?.focus();
    sendToTutor(text, updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: "welcome-new",
      role: "tutor",
      content: t.welcomeMsg,
      timestamp: new Date(),
    }]);
    setSteps([]);
    setInput("");
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* keyframes para dots */}
      <style>{`
        @keyframes esl-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <div style={s.root}>

        {/* ── Panel izquierdo: chat ── */}
        <div style={s.chatPanel}>

          {/* Header */}
          <div style={s.chatHeader}>
            <div style={s.headerLeft}>
              <div style={s.headerAvatar}><ESLLogo size={22} /></div>
              <div>
                <div style={s.headerTitle}>{t.tutorName}</div>
                <div style={s.headerStatus}>
                  <div style={{ ...s.statusDot, background: loading ? "var(--esl-orange)" : "var(--esl-green)" }} />
                  {loading ? t.thinking + "..." : (locale === "es" ? "En línea" : "Online")}
                </div>
              </div>
            </div>
            <div style={s.headerActions}>
              <button style={s.headerBtn} onClick={handleNewChat} title={t.newChat}>
                ✦ {t.newChat}
              </button>
              <button
                style={{ ...s.headerBtn, ...(showSteps ? s.headerBtnActive : {}) }}
                onClick={() => setShowSteps((v) => !v)}
              >
                {locale === "es" ? "📋 Pasos" : "📋 Steps"}
              </button>
            </div>
          </div>

          {/* Problem badge if loaded */}
          {initialProblem && (
            <div style={s.problemBanner}>
              <span style={s.problemBannerIcon}>📚</span>
              <div style={s.problemBannerText}>
                <span style={s.problemBannerTeks}>{initialProblem.teks}</span>
                <span style={s.problemBannerQ}>{initialProblem.question.slice(0, 80)}…</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={s.messagesArea}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                tutorName={t.tutorName}
                youLabel={t.you}
              />
            ))}

            {/* Suggestions */}
            {showSuggestions && (
              <div style={s.suggestionsWrap}>
                <div style={s.suggestionsLabel}>
                  {locale === "es" ? "Sugerencias para empezar:" : "Suggestions to get started:"}
                </div>
                <div style={s.suggestionsList}>
                  {t.suggestions.map((s) => (
                    <button
                      key={s}
                      style={sugg.btn}
                      onClick={() => handleSuggestion(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div style={s.inputArea}>
            <div style={s.inputWrap}>
              <textarea
                ref={inputRef}
                style={s.textarea}
                placeholder={t.inputPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <button
                style={{
                  ...s.sendBtn,
                  ...((!input.trim() || loading) ? s.sendBtnDisabled : {}),
                }}
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                {loading
                  ? <div style={s.spinner} />
                  : <span style={{ fontSize: 18 }}>↑</span>
                }
              </button>
            </div>
            <div style={s.inputHint}>
              {locale === "es"
                ? "Enter para enviar · Shift+Enter para nueva línea"
                : "Enter to send · Shift+Enter for new line"}
            </div>
          </div>
        </div>

        {/* ── Panel derecho: steps ── */}
        {showSteps && (
          <StepPanel
            steps={steps}
            title={t.steps}
            desc={t.stepsDesc}
            noSteps={t.noSteps}
          />
        )}
      </div>
    </>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "calc(100vh - 0px)",
    fontFamily: "var(--font-body)",
    background: "var(--esl-off-white)",
    overflow: "hidden",
  },

  // Chat panel
  chatPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    background: "var(--esl-white)",
  },

  // Header
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid var(--esl-gray-100)",
    background: "var(--esl-white)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 40, height: 40,
    borderRadius: "50%",
    background: "var(--esl-beige)",
    border: "1.5px solid var(--esl-beige-dark)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--esl-brown-dark)",
  },
  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    color: "var(--esl-text-muted)",
  },
  statusDot: {
    width: 7, height: 7,
    borderRadius: "50%",
    transition: "background 0.3s",
  },
  headerActions: {
    display: "flex",
    gap: 8,
  },
  headerBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--esl-gray-200)",
    background: "transparent",
    color: "var(--esl-text-secondary)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    transition: "all 0.12s",
  },
  headerBtnActive: {
    background: "var(--esl-orange-muted)",
    color: "var(--esl-orange-dark)",
    borderColor: "var(--esl-orange-light)",
  },

  // Problem banner
  problemBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    background: "var(--esl-blue-muted)",
    borderBottom: "1px solid var(--esl-blue-light)",
    flexShrink: 0,
  },
  problemBannerIcon: { fontSize: 16, flexShrink: 0 },
  problemBannerText: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
    flexWrap: "wrap",
  },
  problemBannerTeks: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    color: "var(--esl-blue-dark)",
    background: "var(--esl-blue-light)",
    padding: "2px 8px",
    borderRadius: 99,
    flexShrink: 0,
  },
  problemBannerQ: {
    fontSize: 12,
    color: "var(--esl-blue-dark)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },

  // Messages
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  // Suggestions
  suggestionsWrap: {
    marginTop: 12,
  },
  suggestionsLabel: {
    fontSize: 11,
    color: "var(--esl-text-muted)",
    fontWeight: 600,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  suggestionsList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  // Input
  inputArea: {
    padding: "14px 16px",
    borderTop: "1px solid var(--esl-gray-100)",
    background: "var(--esl-white)",
    flexShrink: 0,
  },
  inputWrap: {
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
    background: "var(--esl-gray-50)",
    borderRadius: 14,
    border: "1px solid var(--esl-gray-200)",
    padding: "10px 10px 10px 16px",
  },
  textarea: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    color: "var(--esl-text-primary)",
    resize: "none",
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 38, height: 38,
    borderRadius: 10,
    border: "none",
    background: "var(--esl-orange)",
    color: "var(--esl-white)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    fontWeight: 700,
    transition: "all 0.12s",
  },
  sendBtnDisabled: {
    background: "var(--esl-gray-200)",
    color: "var(--esl-gray-500)",
    cursor: "not-allowed",
  },
  spinner: {
    width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "esl-bounce 0.7s linear infinite",
  },
  inputHint: {
    fontSize: 10,
    color: "var(--esl-text-muted)",
    marginTop: 6,
    paddingLeft: 4,
  },
};

const sugg: Record<string, React.CSSProperties> = {
  btn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--esl-gray-200)",
    background: "var(--esl-white)",
    color: "var(--esl-text-secondary)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    textAlign: "left",
    transition: "all 0.12s",
    width: "100%",
  },
};
