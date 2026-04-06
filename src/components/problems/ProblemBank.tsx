// ============================================================
//  ESL MUÑOZ CONSTANZO — ProblemBank.tsx
//  Rediseñado con sistema de marca oficial
// ============================================================

import { useState, useMemo } from "react";
import { useLang } from "../../contexts/LangContext";
import { PROBLEMS as problems } from "../../data/problems";
import type { Problem } from "../../types/index";

// ── Traducciones ─────────────────────────────────────────────
const tr = {
  es: {
    title: "Banco de Problemas",
    subtitle: "Problemas STAAR alineados a TEKS — 7mo y 8vo grado",
    searchPlaceholder: "Buscar por TEKS, tema o palabra clave...",
    filters: {
      all: "Todos",
      grade7: "7mo grado",
      grade8: "8vo grado",
      difficulty: "Dificultad",
      easy: "Fácil",
      medium: "Medio",
      hard: "Difícil",
    },
    categories: "Categorías",
    results: (n: number) => `${n} problema${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`,
    noResults: "No se encontraron problemas con esos filtros.",
    clearFilters: "Limpiar filtros",
    solve: "Resolver con Tutor IA",
    preview: "Vista previa",
    teks: "TEKS",
    grade: "Grado",
    difficulty: "Dificultad",
    category: "Categoría",
    modalClose: "Cerrar",
    diffLabels: { easy: "Fácil", medium: "Medio", hard: "Difícil" },
    categories_list: [
      "Álgebra",
      "Geometría",
      "Probabilidad",
      "Estadística",
      "Números",
      "Funciones",
    ],
  },
  en: {
    title: "Problem Bank",
    subtitle: "STAAR problems aligned to TEKS — 7th and 8th grade",
    searchPlaceholder: "Search by TEKS, topic or keyword...",
    filters: {
      all: "All",
      grade7: "7th grade",
      grade8: "8th grade",
      difficulty: "Difficulty",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    },
    categories: "Categories",
    results: (n: number) => `${n} problem${n !== 1 ? "s" : ""} found`,
    noResults: "No problems found with those filters.",
    clearFilters: "Clear filters",
    solve: "Solve with AI Tutor",
    preview: "Preview",
    teks: "TEKS",
    grade: "Grade",
    difficulty: "Difficulty",
    category: "Category",
    modalClose: "Close",
    diffLabels: { easy: "Easy", medium: "Medium", hard: "Hard" },
    categories_list: [
      "Algebra",
      "Geometry",
      "Probability",
      "Statistics",
      "Numbers",
      "Functions",
    ],
  },
};

// ── Mock problems (se mezclan con los de problems.ts) ────────
const MOCK_PROBLEMS: Problem[] = [
  {
    id: "mock-1",
    teks: "7.4A",
    grade: 7,
    difficulty: "easy",
    category: "Algebra",
    question: "Si 3x + 7 = 22, ¿cuál es el valor de x?",
    options: ["x = 3", "x = 5", "x = 7", "x = 9"],
    answer: "x = 5",
    explanation: "Resta 7 a ambos lados: 3x = 15. Divide entre 3: x = 5.",
  },
  {
    id: "mock-2",
    teks: "7.6G",
    grade: 7,
    difficulty: "medium",
    category: "Probability",
    question: "Una bolsa tiene 4 bolas rojas y 6 azules. ¿Cuál es la probabilidad de sacar una bola roja?",
    options: ["2/5", "3/5", "1/4", "2/3"],
    answer: "2/5",
    explanation: "P(roja) = 4/(4+6) = 4/10 = 2/5.",
  },
  {
    id: "mock-3",
    teks: "8.4B",
    grade: 8,
    difficulty: "medium",
    category: "Functions",
    question: "¿Cuál es la pendiente de la recta que pasa por los puntos (2, 3) y (6, 11)?",
    options: ["m = 1", "m = 2", "m = 3", "m = 4"],
    answer: "m = 2",
    explanation: "m = (11 - 3)/(6 - 2) = 8/4 = 2.",
  },
  {
    id: "mock-4",
    teks: "8.8C",
    grade: 8,
    difficulty: "hard",
    category: "Geometry",
    question: "Un triángulo rectángulo tiene catetos de 6 cm y 8 cm. ¿Cuánto mide la hipotenusa?",
    options: ["10 cm", "12 cm", "14 cm", "√(100) cm"],
    answer: "10 cm",
    explanation: "c² = 6² + 8² = 36 + 64 = 100. c = √100 = 10 cm.",
  },
  {
    id: "mock-5",
    teks: "7.9A",
    grade: 7,
    difficulty: "easy",
    category: "Geometry",
    question: "¿Cuál es el área de un triángulo con base 10 cm y altura 6 cm?",
    options: ["30 cm²", "60 cm²", "16 cm²", "15 cm²"],
    answer: "30 cm²",
    explanation: "Área = (base × altura) / 2 = (10 × 6) / 2 = 30 cm².",
  },
  {
    id: "mock-6",
    teks: "8.12D",
    grade: 8,
    difficulty: "hard",
    category: "Statistics",
    question: "En un conjunto de datos, la media es 15 y la mediana es 12. ¿Cómo se describe la distribución?",
    options: ["Simétrica", "Sesgada a la derecha", "Sesgada a la izquierda", "Uniforme"],
    answer: "Sesgada a la derecha",
    explanation: "Cuando media > mediana, la distribución tiene una cola hacia la derecha.",
  },
];

// ── Helpers ──────────────────────────────────────────────────
const DIFF_STYLES: Record<string, { bg: string; color: string }> = {
  easy:   { bg: "var(--esl-green-light)",  color: "var(--esl-green-dark)" },
  medium: { bg: "var(--esl-orange-light)", color: "var(--esl-orange-dark)" },
  hard:   { bg: "#FEE2E2",                 color: "#991B1B" },
};

const GRADE_COLORS: Record<number, { bg: string; color: string }> = {
  7: { bg: "var(--esl-blue-light)",  color: "var(--esl-blue-dark)" },
  8: { bg: "var(--esl-beige)",       color: "var(--esl-brown-dark)" },
};

const CATEGORY_COLORS = [
  { bg: "var(--esl-blue-light)",   color: "var(--esl-blue-dark)" },
  { bg: "var(--esl-green-light)",  color: "var(--esl-green-dark)" },
  { bg: "var(--esl-orange-light)", color: "var(--esl-orange-dark)" },
  { bg: "var(--esl-beige)",        color: "var(--esl-brown-dark)" },
  { bg: "#F0E4D8",                 color: "var(--esl-brown-dark)" },
  { bg: "#EDE9FE",                 color: "#5B21B6" },
];

function catColor(cat: string, idx: number) {
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
}

// ── Modal de preview ─────────────────────────────────────────
function ProblemModal({
  problem,
  lang,
  onClose,
  onSolve,
}: {
  problem: Problem;
  lang: "es" | "en";
  onClose: () => void;
  onSolve: (p: Problem) => void;
}) {
  const t = tr[lang];
  const diff = DIFF_STYLES[problem.difficulty] ?? DIFF_STYLES.medium;
  const grade = GRADE_COLORS[problem.grade] ?? GRADE_COLORS[7];
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={ms.header}>
          <div style={ms.headerBadges}>
            <span style={{ ...ms.badge, background: diff.bg, color: diff.color }}>
              {t.diffLabels[problem.difficulty as keyof typeof t.diffLabels]}
            </span>
            <span style={{ ...ms.badge, background: grade.bg, color: grade.color }}>
              {problem.grade}°
            </span>
            <span style={{ ...ms.badge, background: "var(--esl-blue-light)", color: "var(--esl-blue-dark)", fontFamily: "var(--font-mono)" }}>
              {problem.teks}
            </span>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Question */}
        <div style={ms.question}>{problem.question}</div>

        {/* Options */}
        {problem.options && (
          <div style={ms.optionsList}>
            {problem.options.map((opt) => {
              const isCorrect = opt === problem.answer;
              const isSelected = opt === selected;
              let bg = "var(--esl-white)";
              let border = "1px solid var(--esl-gray-200)";
              let color = "var(--esl-text-primary)";
              if (revealed && isCorrect) { bg = "var(--esl-green-muted)"; border = "1.5px solid var(--esl-green)"; color = "var(--esl-green-dark)"; }
              else if (revealed && isSelected && !isCorrect) { bg = "#FEF2F2"; border = "1.5px solid #EF4444"; color = "#991B1B"; }
              else if (isSelected) { bg = "var(--esl-blue-light)"; border = "1.5px solid var(--esl-blue)"; color = "var(--esl-blue-dark)"; }
              return (
                <button
                  key={opt}
                  style={{ ...ms.option, background: bg, border, color }}
                  onClick={() => !revealed && setSelected(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Explanation */}
        {revealed && problem.explanation && (
          <div style={ms.explanation}>
            <div style={ms.explanationLabel}>
              {lang === "es" ? "💡 Explicación" : "💡 Explanation"}
            </div>
            {problem.explanation}
          </div>
        )}

        {/* Actions */}
        <div style={ms.actions}>
          {!revealed && selected && (
            <button
              style={ms.checkBtn}
              onClick={() => setRevealed(true)}
            >
              {lang === "es" ? "Verificar respuesta" : "Check answer"}
            </button>
          )}
          <button style={ms.solveBtn} onClick={() => onSolve(problem)}>
            {t.solve} →
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function ProblemBank({
  onSolveWithTutor,
}: {
  onSolveWithTutor?: (problem: Problem) => void;
}) {
  const { lang } = useLang();
  const locale = (lang as "es" | "en") ?? "es";
  const t = tr[locale];

  // Mezcla problemas reales + mock
  const allProblems: Problem[] = useMemo(() => {
    const real = Array.isArray(problems) ? problems : [];
    return [...real, ...MOCK_PROBLEMS];
  }, []);

  const [search, setSearch]             = useState("");
  const [gradeFilter, setGradeFilter]   = useState<"all" | "7" | "8">("all");
  const [diffFilter, setDiffFilter]     = useState<"all" | "easy" | "medium" | "hard">("all");
  const [catFilter, setCatFilter]       = useState<string>("all");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Categorías únicas
  const categories = useMemo(() => {
    const cats = new Set(allProblems.map((p) => p.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [allProblems]);

  // Filtrado
  const filtered = useMemo(() => {
    return allProblems.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.teks?.toLowerCase().includes(q) ||
        p.question?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      const matchGrade = gradeFilter === "all" || String(p.grade) === gradeFilter;
      const matchDiff  = diffFilter  === "all" || p.difficulty === diffFilter;
      const matchCat   = catFilter   === "all" || p.category === catFilter;
      return matchSearch && matchGrade && matchDiff && matchCat;
    });
  }, [allProblems, search, gradeFilter, diffFilter, catFilter]);

  const hasFilters = search || gradeFilter !== "all" || diffFilter !== "all" || catFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setGradeFilter("all");
    setDiffFilter("all");
    setCatFilter("all");
  };

  return (
    <div style={s.root}>

      {/* ── Header ── */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>{t.title}</h1>
          <p style={s.pageSubtitle}>{t.subtitle}</p>
        </div>
        <div style={s.headerStats}>
          {[
            { label: "Total", value: allProblems.length, color: "var(--esl-brown-dark)" },
            { label: "7°",    value: allProblems.filter((p) => p.grade === 7).length, color: "var(--esl-blue-dark)" },
            { label: "8°",    value: allProblems.filter((p) => p.grade === 8).length, color: "var(--esl-orange-dark)" },
          ].map((st) => (
            <div key={st.label} style={s.headerStat}>
              <span style={{ ...s.headerStatValue, color: st.color }}>{st.value}</span>
              <span style={s.headerStatLabel}>{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div style={s.filtersBar}>

        {/* Search */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={s.clearSearch} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Grade pills */}
        <div style={s.filterGroup}>
          {(["all", "7", "8"] as const).map((g) => (
            <button
              key={g}
              style={{ ...s.filterPill, ...(gradeFilter === g ? s.filterPillActive : {}) }}
              onClick={() => setGradeFilter(g)}
            >
              {g === "all" ? t.filters.all : g === "7" ? t.filters.grade7 : t.filters.grade8}
            </button>
          ))}
        </div>

        {/* Difficulty pills */}
        <div style={s.filterGroup}>
          {(["all", "easy", "medium", "hard"] as const).map((d) => {
            const active = diffFilter === d;
            const ds = d !== "all" ? DIFF_STYLES[d] : null;
            return (
              <button
                key={d}
                style={{
                  ...s.filterPill,
                  ...(active && ds ? { background: ds.bg, color: ds.color, borderColor: ds.color } : {}),
                  ...(active && !ds ? s.filterPillActive : {}),
                }}
                onClick={() => setDiffFilter(d)}
              >
                {d === "all" ? t.filters.all
                  : d === "easy" ? t.filters.easy
                  : d === "medium" ? t.filters.medium
                  : t.filters.hard}
              </button>
            );
          })}
        </div>

        {/* Clear */}
        {hasFilters && (
          <button style={s.clearFiltersBtn} onClick={clearFilters}>
            {t.clearFilters}
          </button>
        )}
      </div>

      {/* ── Category chips ── */}
      <div style={s.catRow}>
        {categories.map((cat, i) => {
          const active = catFilter === cat;
          const cc = cat !== "all" ? catColor(cat, i - 1) : null;
          return (
            <button
              key={cat}
              style={{
                ...s.catChip,
                ...(active && cc ? { background: cc.bg, color: cc.color, borderColor: cc.color } : {}),
                ...(active && !cc ? s.catChipActive : {}),
              }}
              onClick={() => setCatFilter(cat)}
            >
              {cat === "all" ? t.filters.all : cat}
            </button>
          );
        })}
      </div>

      {/* ── Results count ── */}
      <div style={s.resultsRow}>
        <span style={s.resultsCount}>{t.results(filtered.length)}</span>
      </div>

      {/* ── Grid de problemas ── */}
      {filtered.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>🔍</div>
          <p style={s.emptyText}>{t.noResults}</p>
          <button style={s.clearFiltersBtn} onClick={clearFilters}>{t.clearFilters}</button>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((problem, idx) => {
            const diff  = DIFF_STYLES[problem.difficulty] ?? DIFF_STYLES.medium;
            const grade = GRADE_COLORS[problem.grade] ?? GRADE_COLORS[7];
            const catIdx = categories.indexOf(problem.category);
            const cc = catColor(problem.category, catIdx - 1);

            return (
              <div
                key={problem.id ?? idx}
                style={s.problemCard}
                onClick={() => setSelectedProblem(problem)}
              >
                {/* Card header */}
                <div style={s.cardTop}>
                  <div style={s.cardBadges}>
                    <span style={{ ...s.badge, background: grade.bg, color: grade.color }}>
                      {problem.grade}°
                    </span>
                    <span style={{ ...s.badge, background: "var(--esl-blue-light)", color: "var(--esl-blue-dark)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                      {problem.teks}
                    </span>
                  </div>
                  <span style={{ ...s.badge, background: diff.bg, color: diff.color }}>
                    {t.diffLabels[problem.difficulty as keyof typeof t.diffLabels]}
                  </span>
                </div>

                {/* Question */}
                <p style={s.questionText}>{problem.question}</p>

                {/* Options preview */}
                {problem.options && (
                  <div style={s.optionsPreview}>
                    {problem.options.slice(0, 2).map((opt) => (
                      <span key={opt} style={s.optionPreviewPill}>{opt}</span>
                    ))}
                    {problem.options.length > 2 && (
                      <span style={s.optionMore}>+{problem.options.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div style={s.cardFooter}>
                  {problem.category && (
                    <span style={{ ...s.badge, background: cc.bg, color: cc.color, fontSize: 10 }}>
                      {problem.category}
                    </span>
                  )}
                  <button
                    style={s.solveBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSolveWithTutor?.(problem);
                    }}
                  >
                    {t.solve} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {selectedProblem && (
        <ProblemModal
          problem={selectedProblem}
          lang={locale}
          onClose={() => setSelectedProblem(null)}
          onSolve={(p) => {
            setSelectedProblem(null);
            onSolveWithTutor?.(p);
          }}
        />
      )}
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    padding: "28px 28px",
    maxWidth: 1200,
    fontFamily: "var(--font-body)",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 26,
    fontWeight: 700,
    color: "var(--esl-brown-dark)",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "var(--esl-text-muted)",
  },
  headerStats: {
    display: "flex",
    gap: 4,
    background: "var(--esl-white)",
    border: "1px solid var(--esl-gray-100)",
    borderRadius: 12,
    padding: "10px 16px",
    boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  },
  headerStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 12px",
    borderRight: "1px solid var(--esl-gray-100)",
  },
  headerStatValue: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
  },
  headerStatLabel: {
    fontSize: 10,
    color: "var(--esl-text-muted)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginTop: 2,
  },

  // Filters
  filtersBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--esl-white)",
    border: "1px solid var(--esl-gray-200)",
    borderRadius: 10,
    padding: "8px 12px",
    flex: "0 0 280px",
  },
  searchIcon: { fontSize: 14, flexShrink: 0 },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 13,
    color: "var(--esl-text-primary)",
    background: "transparent",
    flex: 1,
    fontFamily: "var(--font-body)",
  },
  clearSearch: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "var(--esl-text-muted)",
    fontSize: 12,
    padding: 2,
  },
  filterGroup: {
    display: "flex",
    gap: 4,
    background: "var(--esl-beige)",
    padding: 3,
    borderRadius: 8,
  },
  filterPill: {
    padding: "5px 12px",
    borderRadius: 6,
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--esl-text-muted)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    transition: "all 0.12s",
    whiteSpace: "nowrap",
  },
  filterPillActive: {
    background: "var(--esl-white)",
    color: "var(--esl-brown-dark)",
    boxShadow: "0 1px 3px rgba(44,26,14,0.08)",
  },
  clearFiltersBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--esl-gray-200)",
    background: "transparent",
    color: "var(--esl-text-muted)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },

  // Category chips
  catRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  catChip: {
    padding: "4px 12px",
    borderRadius: 99,
    border: "1px solid var(--esl-gray-200)",
    background: "var(--esl-white)",
    color: "var(--esl-text-secondary)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    transition: "all 0.12s",
  },
  catChipActive: {
    background: "var(--esl-beige)",
    color: "var(--esl-brown-dark)",
    borderColor: "var(--esl-beige-dark)",
  },

  resultsRow: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 12,
    color: "var(--esl-text-muted)",
    fontWeight: 500,
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 14,
  },

  // Problem card
  problemCard: {
    background: "var(--esl-white)",
    borderRadius: 14,
    border: "1px solid var(--esl-gray-100)",
    padding: "18px 18px",
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 2px 8px rgba(44,26,14,0.04)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardBadges: {
    display: "flex",
    gap: 5,
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 9px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  questionText: {
    fontSize: 14,
    color: "var(--esl-text-primary)",
    lineHeight: 1.6,
    flex: 1,
    fontWeight: 500,
  },
  optionsPreview: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  optionPreviewPill: {
    fontSize: 11,
    color: "var(--esl-text-secondary)",
    background: "var(--esl-gray-50)",
    border: "1px solid var(--esl-gray-100)",
    borderRadius: 6,
    padding: "3px 9px",
  },
  optionMore: {
    fontSize: 11,
    color: "var(--esl-text-muted)",
    padding: "3px 6px",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 10,
    borderTop: "1px solid var(--esl-gray-100)",
  },
  solveBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "none",
    background: "var(--esl-orange)",
    color: "var(--esl-white)",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    whiteSpace: "nowrap",
    transition: "all 0.12s",
  },

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: 12,
  },
  emptyIcon: { fontSize: 40, marginBottom: 4 },
  emptyText: {
    fontSize: 14,
    color: "var(--esl-text-muted)",
    textAlign: "center",
  },
};

// ── Modal styles ─────────────────────────────────────────────
const ms: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(44,26,14,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: 20,
  },
  modal: {
    background: "var(--esl-white)",
    borderRadius: 18,
    padding: "28px 28px",
    maxWidth: 540,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(44,26,14,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontFamily: "var(--font-body)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerBadges: { display: "flex", gap: 6, flexWrap: "wrap" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
  },
  closeBtn: {
    border: "none",
    background: "var(--esl-gray-100)",
    color: "var(--esl-text-muted)",
    width: 30,
    height: 30,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  question: {
    fontSize: 17,
    fontWeight: 600,
    color: "var(--esl-brown-dark)",
    lineHeight: 1.6,
    fontFamily: "var(--font-display)",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  option: {
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "var(--font-body)",
    transition: "all 0.12s",
  },
  explanation: {
    background: "var(--esl-green-muted)",
    borderLeft: "3px solid var(--esl-green)",
    borderRadius: "0 10px 10px 0",
    padding: "12px 16px",
    fontSize: 14,
    color: "var(--esl-green-dark)",
    lineHeight: 1.6,
  },
  explanationLabel: {
    fontWeight: 700,
    marginBottom: 4,
    fontFamily: "var(--font-display)",
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    paddingTop: 8,
    borderTop: "1px solid var(--esl-gray-100)",
  },
  checkBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "var(--esl-blue)",
    color: "var(--esl-white)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  solveBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "var(--esl-orange)",
    color: "var(--esl-white)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
};
