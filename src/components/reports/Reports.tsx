// ============================================================
//  ESL MUÑOZ CONSTANZO — Reports.tsx
//  Rediseñado con sistema de marca oficial
// ============================================================

import { useState, useMemo } from "react";
import { useLang } from "../../contexts/LangContext";

// ── Tipos ────────────────────────────────────────────────────
interface StudentReport {
  id: string;
  name: string;
  grade: 7 | 8;
  problemsSolved: number;
  avgScore: number;
  teksScores: Record<string, number>;
  trend: "up" | "down" | "stable";
  lastActive: string;
}

interface TeksReport {
  code: string;
  label: string;
  grade: 7 | 8;
  classAvg: number;
  studentsAbove80: number;
  studentsBelow60: number;
  total: number;
}

// ── Mock data ─────────────────────────────────────────────────
const MOCK_STUDENTS: StudentReport[] = [
  { id: "1", name: "Ana García",      grade: 7, problemsSolved: 24, avgScore: 88, trend: "up",     lastActive: "Hoy",         teksScores: { "7.4A": 92, "7.6G": 80, "7.9A": 88, "8.4B": 85 } },
  { id: "2", name: "Carlos López",    grade: 7, problemsSolved: 18, avgScore: 72, trend: "stable", lastActive: "Ayer",        teksScores: { "7.4A": 70, "7.6G": 68, "7.9A": 74, "8.4B": 75 } },
  { id: "3", name: "María Torres",    grade: 8, problemsSolved: 31, avgScore: 94, trend: "up",     lastActive: "Hoy",         teksScores: { "7.4A": 96, "7.6G": 90, "7.9A": 94, "8.8C": 98 } },
  { id: "4", name: "Luis Ramírez",    grade: 7, problemsSolved:  9, avgScore: 51, trend: "down",   lastActive: "Hace 3 días", teksScores: { "7.4A": 48, "7.6G": 55, "7.9A": 50, "8.4B": 52 } },
  { id: "5", name: "Sofía Méndez",    grade: 8, problemsSolved: 22, avgScore: 79, trend: "up",     lastActive: "Hoy",         teksScores: { "7.4A": 82, "7.6G": 75, "8.4B": 78, "8.8C": 80 } },
  { id: "6", name: "Diego Herrera",   grade: 8, problemsSolved: 15, avgScore: 63, trend: "stable", lastActive: "Ayer",        teksScores: { "7.4A": 60, "8.4B": 65, "8.8C": 62, "8.12D": 66 } },
  { id: "7", name: "Valentina Cruz",  grade: 7, problemsSolved: 27, avgScore: 85, trend: "up",     lastActive: "Hoy",         teksScores: { "7.4A": 88, "7.6G": 82, "7.9A": 86, "8.4B": 84 } },
  { id: "8", name: "Andrés Morales",  grade: 8, problemsSolved: 11, avgScore: 58, trend: "down",   lastActive: "Hace 4 días", teksScores: { "8.4B": 55, "8.8C": 60, "8.12D": 58 } },
];

const MOCK_TEKS: TeksReport[] = [
  { code: "7.4A", label: "Ecuaciones lineales",      grade: 7, classAvg: 82, studentsAbove80: 14, studentsBelow60: 3,  total: 20 },
  { code: "7.6G", label: "Probabilidad",             grade: 7, classAvg: 65, studentsAbove80:  8, studentsBelow60: 7,  total: 20 },
  { code: "7.9A", label: "Área y volumen",           grade: 7, classAvg: 74, studentsAbove80: 11, studentsBelow60: 4,  total: 20 },
  { code: "8.4B", label: "Pendiente de recta",       grade: 8, classAvg: 47, studentsAbove80:  4, studentsBelow60: 12, total: 20 },
  { code: "8.8C", label: "Teorema de Pitágoras",     grade: 8, classAvg: 91, studentsAbove80: 18, studentsBelow60: 1,  total: 20 },
  { code: "8.12D", label: "Análisis de datos",       grade: 8, classAvg: 58, studentsAbove80:  6, studentsBelow60: 9,  total: 20 },
];

// ── Helpers ───────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 80) return "var(--esl-green-dark)";
  if (score >= 60) return "var(--esl-orange-dark)";
  return "#DC2626";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "var(--esl-green-light)";
  if (score >= 60) return "var(--esl-orange-light)";
  return "#FEE2E2";
}

function getBarColor(score: number): string {
  if (score >= 80) return "var(--esl-green)";
  if (score >= 60) return "var(--esl-orange)";
  return "#EF4444";
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function getTrendIcon(trend: StudentReport["trend"]): { icon: string; color: string } {
  if (trend === "up")     return { icon: "↑", color: "var(--esl-green-dark)" };
  if (trend === "down")   return { icon: "↓", color: "#DC2626" };
  return                         { icon: "→", color: "var(--esl-text-muted)" };
}

// ── Traducciones ──────────────────────────────────────────────
const tr = {
  es: {
    title: "Reportes",
    subtitle: "Análisis de desempeño por alumno y por TEKS",
    tabs: { overview: "Resumen", byStudent: "Por alumno", byTeks: "Por TEKS", export: "Exportar" },
    overview: {
      classAvg: "Promedio de la clase",
      totalProblems: "Problemas resueltos",
      activeStudents: "Alumnos activos",
      needsAttention: "Necesitan atención",
      topStudents: "Mejores alumnos",
      weakestTeks: "TEKS más difíciles",
      strongestTeks: "TEKS dominados",
    },
    student: {
      name: "Alumno",
      grade: "Grado",
      problems: "Problemas",
      avg: "Promedio",
      trend: "Tendencia",
      lastActive: "Último acceso",
      details: "Ver detalle",
      teksBreakdown: "Desglose por TEKS",
    },
    teks: {
      code: "TEKS",
      topic: "Tema",
      classAvg: "Promedio clase",
      above80: "> 80%",
      below60: "< 60%",
      status: "Estado",
      ok: "Dominado",
      warning: "En progreso",
      critical: "Crítico",
    },
    filters: { all: "Todos", grade7: "7mo grado", grade8: "8vo grado" },
    export: {
      title: "Exportar reporte",
      desc: "Descarga el reporte completo de tu clase en formato PDF o CSV.",
      pdf: "Descargar PDF",
      csv: "Exportar CSV",
      note: "Los datos corresponden al ciclo escolar actual.",
      comingSoon: "Próximamente disponible",
    },
    noData: "Sin datos disponibles",
    diffLabels: { easy: "Fácil", medium: "Medio", hard: "Difícil" },
  },
  en: {
    title: "Reports",
    subtitle: "Performance analysis by student and TEKS",
    tabs: { overview: "Overview", byStudent: "By student", byTeks: "By TEKS", export: "Export" },
    overview: {
      classAvg: "Class average",
      totalProblems: "Problems solved",
      activeStudents: "Active students",
      needsAttention: "Need attention",
      topStudents: "Top students",
      weakestTeks: "Weakest TEKS",
      strongestTeks: "Strongest TEKS",
    },
    student: {
      name: "Student",
      grade: "Grade",
      problems: "Problems",
      avg: "Average",
      trend: "Trend",
      lastActive: "Last active",
      details: "View details",
      teksBreakdown: "TEKS breakdown",
    },
    teks: {
      code: "TEKS",
      topic: "Topic",
      classAvg: "Class avg",
      above80: "> 80%",
      below60: "< 60%",
      status: "Status",
      ok: "Mastered",
      warning: "In progress",
      critical: "Critical",
    },
    filters: { all: "All", grade7: "7th grade", grade8: "8th grade" },
    export: {
      title: "Export report",
      desc: "Download your complete class report in PDF or CSV format.",
      pdf: "Download PDF",
      csv: "Export CSV",
      note: "Data corresponds to the current school year.",
      comingSoon: "Coming soon",
    },
    noData: "No data available",
    diffLabels: { easy: "Easy", medium: "Medium", hard: "Hard" },
  },
};

// ── Mini bar chart ────────────────────────────────────────────
function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: "var(--esl-beige-dark)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────
function OverviewTab({ students, teks, t }: { students: StudentReport[]; teks: TeksReport[]; t: typeof tr["es"] }) {
  const classAvg   = Math.round(students.reduce((a, s) => a + s.avgScore, 0) / students.length);
  const totalProbs = students.reduce((a, s) => a + s.problemsSolved, 0);
  const activeToday = students.filter((s) => s.lastActive === "Hoy").length;
  const needsHelp   = students.filter((s) => s.avgScore < 60).length;

  const topStudents  = [...students].sort((a, b) => b.avgScore - a.avgScore).slice(0, 3);
  const sortedTeks   = [...teks].sort((a, b) => a.classAvg - b.classAvg);
  const weakest      = sortedTeks.slice(0, 2);
  const strongest    = sortedTeks.slice(-2).reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Stat cards */}
      <div style={s.grid4}>
        {[
          { label: t.overview.classAvg,       value: `${classAvg}%`, icon: "📈", color: "var(--esl-orange)", bg: "var(--esl-orange-light)" },
          { label: t.overview.totalProblems,  value: totalProbs,     icon: "✅", color: "var(--esl-blue)",   bg: "var(--esl-blue-light)" },
          { label: t.overview.activeStudents, value: activeToday,    icon: "👥", color: "var(--esl-green)",  bg: "var(--esl-green-light)" },
          { label: t.overview.needsAttention, value: needsHelp,      icon: "⚠️", color: "#DC2626",           bg: "#FEE2E2" },
        ].map((c) => (
          <div key={c.label} style={s.statCard}>
            <div style={{ ...s.statIcon, background: c.bg, color: c.color }}>{c.icon}</div>
            <div>
              <div style={{ ...s.statValue, color: c.color }}>{c.value}</div>
              <div style={s.statLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.grid2}>

        {/* Top students */}
        <div style={s.card}>
          <div style={s.cardTitle}>{t.overview.topStudents}</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            {topStudents.map((st, i) => (
              <div key={st.id} style={s.topRow}>
                <div style={{ ...s.rankBadge, background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : "#FEF0E8", color: i === 0 ? "#92400E" : i === 1 ? "#475569" : "var(--esl-brown)" }}>
                  {i + 1}
                </div>
                <div style={s.avatarSm}>{getInitials(st.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.studentName}>{st.name}</div>
                  <div style={s.studentSub}>{st.problemsSolved} problemas</div>
                </div>
                <span style={{ ...s.scorePill, background: getScoreBg(st.avgScore), color: getScoreColor(st.avgScore) }}>
                  {st.avgScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TEKS overview */}
        <div style={s.card}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={s.cardTitle}>{t.overview.weakestTeks}</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {weakest.map((tk) => (
                  <div key={tk.code} style={s.teksOverviewRow}>
                    <span style={s.teksCode}>{tk.code}</span>
                    <MiniBar value={tk.classAvg} color={getBarColor(tk.classAvg)} />
                    <span style={{ ...s.teksPct, color: getScoreColor(tk.classAvg) }}>{tk.classAvg}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--esl-gray-100)", paddingTop: 16 }}>
              <div style={s.cardTitle}>{t.overview.strongestTeks}</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {strongest.map((tk) => (
                  <div key={tk.code} style={s.teksOverviewRow}>
                    <span style={s.teksCode}>{tk.code}</span>
                    <MiniBar value={tk.classAvg} color={getBarColor(tk.classAvg)} />
                    <span style={{ ...s.teksPct, color: getScoreColor(tk.classAvg) }}>{tk.classAvg}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Tab: By Student ───────────────────────────────────────────
function StudentTab({ students, t, gradeFilter }: { students: StudentReport[]; t: typeof tr["es"]; gradeFilter: "all"|"7"|"8" }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = gradeFilter === "all" ? students : students.filter((s) => String(s.grade) === gradeFilter);

  return (
    <div style={s.card}>
      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>
              {[t.student.name, t.student.grade, t.student.problems, t.student.avg, t.student.trend, t.student.lastActive, ""].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((st, i) => {
              const trend = getTrendIcon(st.trend);
              const isExpanded = expanded === st.id;
              const teksEntries = Object.entries(st.teksScores);

              return (
                <>
                  <tr key={st.id} style={i % 2 === 0 ? {} : s.trAlt}>
                    {/* Student */}
                    <td style={s.td}>
                      <div style={s.studentCell}>
                        <div style={s.avatarCircle}>{getInitials(st.name)}</div>
                        <div>
                          <div style={s.studentName}>{st.name}</div>
                        </div>
                      </div>
                    </td>
                    {/* Grade */}
                    <td style={{ ...s.td, textAlign: "center" }}>
                      <span style={{ ...s.gradePill, ...(st.grade === 7 ? s.grade7 : s.grade8) }}>
                        {st.grade}°
                      </span>
                    </td>
                    {/* Problems */}
                    <td style={{ ...s.td, textAlign: "center" }}>
                      <span style={s.problemNum}>{st.problemsSolved}</span>
                    </td>
                    {/* Avg */}
                    <td style={{ ...s.td, textAlign: "center" }}>
                      <span style={{ ...s.scorePill, background: getScoreBg(st.avgScore), color: getScoreColor(st.avgScore) }}>
                        {st.avgScore}%
                      </span>
                    </td>
                    {/* Trend */}
                    <td style={{ ...s.td, textAlign: "center" }}>
                      <span style={{ fontSize: 18, color: trend.color, fontWeight: 700 }}>{trend.icon}</span>
                    </td>
                    {/* Last active */}
                    <td style={{ ...s.td, fontSize: 12, color: "var(--esl-text-muted)" }}>
                      {st.lastActive}
                    </td>
                    {/* Expand */}
                    <td style={s.td}>
                      <button
                        style={s.expandBtn}
                        onClick={() => setExpanded(isExpanded ? null : st.id)}
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded TEKS row */}
                  {isExpanded && (
                    <tr key={`${st.id}-exp`}>
                      <td colSpan={7} style={s.expandedCell}>
                        <div style={s.expandedContent}>
                          <div style={s.expandedTitle}>{t.student.teksBreakdown}</div>
                          <div style={s.teksGrid}>
                            {teksEntries.map(([code, pct]) => (
                              <div key={code} style={s.teksCard}>
                                <div style={s.teksCardCode}>{code}</div>
                                <div style={s.teksCardBar}>
                                  <div style={{ ...s.teksBarFill, width: `${pct}%`, background: getBarColor(pct) }} />
                                </div>
                                <div style={{ ...s.teksCardPct, color: getScoreColor(pct) }}>{pct}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: By TEKS ──────────────────────────────────────────────
function TeksTab({ teks, t, gradeFilter }: { teks: TeksReport[]; t: typeof tr["es"]; gradeFilter: "all"|"7"|"8" }) {
  const filtered = gradeFilter === "all" ? teks : teks.filter((tk) => String(tk.grade) === gradeFilter);

  const getStatus = (avg: number) => {
    if (avg >= 80) return { label: t.teks.ok,       bg: "var(--esl-green-light)",  color: "var(--esl-green-dark)" };
    if (avg >= 60) return { label: t.teks.warning,  bg: "var(--esl-orange-light)", color: "var(--esl-orange-dark)" };
    return               { label: t.teks.critical,  bg: "#FEE2E2",                 color: "#991B1B" };
  };

  return (
    <div style={s.card}>
      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>
              {[t.teks.code, t.teks.topic, t.teks.classAvg, t.teks.above80, t.teks.below60, t.teks.status].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tk, i) => {
              const status = getStatus(tk.classAvg);
              return (
                <tr key={tk.code} style={i % 2 === 0 ? {} : s.trAlt}>
                  {/* Code */}
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={s.teksCodePill}>{tk.code}</span>
                      <span style={{ ...s.gradePill, ...(tk.grade === 7 ? s.grade7 : s.grade8), fontSize: 10 }}>
                        {tk.grade}°
                      </span>
                    </div>
                  </td>
                  {/* Topic */}
                  <td style={{ ...s.td, fontSize: 13, color: "var(--esl-text-secondary)" }}>{tk.label}</td>
                  {/* Class avg */}
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MiniBar value={tk.classAvg} color={getBarColor(tk.classAvg)} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: getScoreColor(tk.classAvg), minWidth: 36 }}>
                        {tk.classAvg}%
                      </span>
                    </div>
                  </td>
                  {/* Above 80 */}
                  <td style={{ ...s.td, textAlign: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--esl-green-dark)" }}>
                      {tk.studentsAbove80}
                      <span style={{ fontSize: 11, color: "var(--esl-text-muted)", fontWeight: 400 }}>/{tk.total}</span>
                    </span>
                  </td>
                  {/* Below 60 */}
                  <td style={{ ...s.td, textAlign: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: tk.studentsBelow60 > 5 ? "#DC2626" : "var(--esl-text-muted)" }}>
                      {tk.studentsBelow60}
                      <span style={{ fontSize: 11, color: "var(--esl-text-muted)", fontWeight: 400 }}>/{tk.total}</span>
                    </span>
                  </td>
                  {/* Status */}
                  <td style={s.td}>
                    <span style={{ ...s.statusBadge, background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Export ───────────────────────────────────────────────
function ExportTab({ t }: { t: typeof tr["es"] }) {
  return (
    <div style={s.card}>
      <div style={exp.wrap}>
        <div style={exp.icon}>📄</div>
        <div style={exp.title}>{t.export.title}</div>
        <div style={exp.desc}>{t.export.desc}</div>
        <div style={exp.btnRow}>
          <button style={exp.pdfBtn}>{t.export.pdf}</button>
          <button style={exp.csvBtn}>{t.export.csv}</button>
        </div>
        <div style={exp.note}>
          <span style={exp.noteBadge}>{t.export.comingSoon}</span>
          <span style={exp.noteText}>{t.export.note}</span>
        </div>
      </div>
    </div>
  );
}

const exp: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px",
    gap: 14,
    textAlign: "center",
  },
  icon: { fontSize: 48 },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--esl-brown-dark)",
  },
  desc: {
    fontSize: 14,
    color: "var(--esl-text-muted)",
    maxWidth: 400,
    lineHeight: 1.6,
  },
  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 8,
  },
  pdfBtn: {
    padding: "11px 28px",
    borderRadius: 10,
    border: "none",
    background: "var(--esl-orange)",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    cursor: "not-allowed",
    opacity: 0.5,
    fontFamily: "var(--font-body)",
  },
  csvBtn: {
    padding: "11px 28px",
    borderRadius: 10,
    border: "1px solid var(--esl-gray-200)",
    background: "var(--esl-white)",
    color: "var(--esl-text-secondary)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "not-allowed",
    opacity: 0.5,
    fontFamily: "var(--font-body)",
  },
  note: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  noteBadge: {
    fontSize: 11,
    fontWeight: 700,
    background: "var(--esl-orange-light)",
    color: "var(--esl-orange-dark)",
    padding: "3px 10px",
    borderRadius: 99,
  },
  noteText: {
    fontSize: 12,
    color: "var(--esl-text-muted)",
  },
};

// ── Componente principal ──────────────────────────────────────
export default function Reports() {
  const { lang } = useLang();
  const locale = (lang as "es" | "en") ?? "es";
  const t = tr[locale];

  const [activeTab, setActiveTab]     = useState<"overview" | "byStudent" | "byTeks" | "export">("overview");
  const [gradeFilter, setGradeFilter] = useState<"all" | "7" | "8">("all");

  const tabs = [
    { id: "overview",   label: t.tabs.overview },
    { id: "byStudent",  label: t.tabs.byStudent },
    { id: "byTeks",     label: t.tabs.byTeks },
    { id: "export",     label: t.tabs.export },
  ] as const;

  return (
    <div style={s.root}>

      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>{t.title}</h1>
          <p style={s.pageSubtitle}>{t.subtitle}</p>
        </div>

        {/* Grade filter */}
        <div style={s.gradeFilter}>
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
      </div>

      {/* Tabs */}
      <div style={s.tabsBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>
        {activeTab === "overview"   && <OverviewTab  students={MOCK_STUDENTS} teks={MOCK_TEKS} t={t} />}
        {activeTab === "byStudent"  && <StudentTab   students={MOCK_STUDENTS} t={t} gradeFilter={gradeFilter} />}
        {activeTab === "byTeks"     && <TeksTab      teks={MOCK_TEKS} t={t} gradeFilter={gradeFilter} />}
        {activeTab === "export"     && <ExportTab    t={t} />}
      </div>

    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    padding: "28px 28px",
    maxWidth: 1200,
    fontFamily: "var(--font-body)",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 22,
    gap: 16,
    flexWrap: "wrap",
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

  gradeFilter: {
    display: "flex",
    gap: 4,
    background: "var(--esl-beige)",
    padding: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  filterPill: {
    padding: "6px 14px",
    borderRadius: 6,
    border: "none",
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

  tabsBar: {
    display: "flex",
    gap: 2,
    marginBottom: 20,
    borderBottom: "1px solid var(--esl-gray-100)",
    paddingBottom: 0,
  },
  tab: {
    padding: "10px 18px",
    border: "none",
    background: "transparent",
    color: "var(--esl-text-muted)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    borderBottom: "2px solid transparent",
    marginBottom: -1,
    transition: "all 0.12s",
  },
  tabActive: {
    color: "var(--esl-orange-dark)",
    borderBottomColor: "var(--esl-orange)",
  },

  content: { flex: 1 },

  // Shared card
  card: {
    background: "var(--esl-white)",
    borderRadius: 14,
    border: "1px solid var(--esl-gray-100)",
    padding: "20px 22px",
    boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--esl-brown-dark)",
    marginBottom: 4,
  },

  // Grids
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  // Stat card
  statCard: {
    background: "var(--esl-white)",
    borderRadius: 14,
    border: "1px solid var(--esl-gray-100)",
    padding: "18px 18px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  },
  statIcon: {
    width: 44, height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  statValue: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "var(--esl-text-muted)",
    marginTop: 3,
    fontWeight: 500,
  },

  // Top row
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    width: 24, height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  avatarSm: {
    width: 30, height: 30,
    borderRadius: "50%",
    background: "var(--esl-orange-light)",
    color: "var(--esl-orange-dark)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    flexShrink: 0,
  },
  studentName: { fontSize: 13, fontWeight: 600, color: "var(--esl-brown-dark)" },
  studentSub:  { fontSize: 11, color: "var(--esl-text-muted)" },
  scorePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  // TEKS overview
  teksOverviewRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  teksCode: {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    color: "var(--esl-blue-dark)",
    minWidth: 52,
  },
  teksPct: {
    fontSize: 12,
    fontWeight: 700,
    minWidth: 36,
    textAlign: "right",
  },

  // Table
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--esl-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid var(--esl-gray-100)",
    background: "var(--esl-gray-50)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid var(--esl-gray-100)",
    verticalAlign: "middle",
  },
  trAlt: { background: "var(--esl-gray-50)" },

  studentCell: { display: "flex", alignItems: "center", gap: 10 },
  avatarCircle: {
    width: 32, height: 32,
    borderRadius: "50%",
    background: "var(--esl-orange-light)",
    color: "var(--esl-orange-dark)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    flexShrink: 0,
  },

  gradePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 9px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 700,
  },
  grade7: { background: "var(--esl-blue-light)",  color: "var(--esl-blue-dark)" },
  grade8: { background: "var(--esl-beige)",       color: "var(--esl-brown-dark)" },

  problemNum: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--esl-blue-dark)",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  teksCodePill: {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    color: "var(--esl-blue-dark)",
    background: "var(--esl-blue-light)",
    padding: "2px 8px",
    borderRadius: 99,
  },

  // Expand button
  expandBtn: {
    border: "none",
    background: "var(--esl-gray-100)",
    color: "var(--esl-text-muted)",
    width: 26, height: 26,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  expandedCell: {
    padding: 0,
    borderBottom: "1px solid var(--esl-gray-100)",
  },
  expandedContent: {
    background: "var(--esl-gray-50)",
    padding: "14px 20px",
  },
  expandedTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--esl-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 10,
  },
  teksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 10,
  },
  teksCard: {
    background: "var(--esl-white)",
    borderRadius: 8,
    padding: "10px 12px",
    border: "1px solid var(--esl-gray-100)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  teksCardCode: {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    color: "var(--esl-blue-dark)",
    minWidth: 48,
  },
  teksCardBar: {
    flex: 1,
    height: 6,
    background: "var(--esl-beige-dark)",
    borderRadius: 99,
    overflow: "hidden",
  },
  teksBarFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.4s",
  },
  teksCardPct: {
    fontSize: 11,
    fontWeight: 700,
    minWidth: 30,
    textAlign: "right",
  },
};
