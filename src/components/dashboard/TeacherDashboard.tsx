import { useContext, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { useAuth } from "../../contexts/AuthContext"
import { useLang } from "../../contexts/LangContext"
import logoAI from '../../assets/logo_ai.svg'

Chart.register(...registerables)

/* ─── Types ─── */
interface StatCard {
  label: string
  value: string
  change: string
  color: string
  icon: React.ReactNode
}

interface ActivityItem {
  initials: string
  name: string
  teks: string
  topic: string
  score: string
  time: string
  scoreColor: string
  avatarColor: string
}

/* ─── Icons ─── */
const IconStudents = () => (
  <svg viewBox="0 0 48 48" fill="none" width={48} height={48}>
    <circle cx="24" cy="16" r="8" fill="white" />
    <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16"
      stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const IconProblems = () => (
  <svg viewBox="0 0 48 48" fill="none" width={48} height={48}>
    <rect x="8"  y="28" width="8"  height="12" rx="2" fill="white" />
    <rect x="20" y="20" width="8"  height="20" rx="2" fill="white" />
    <rect x="32" y="10" width="8"  height="30" rx="2" fill="white" />
  </svg>
)

const IconAverage = () => (
  <svg viewBox="0 0 48 48" fill="none" width={48} height={48}>
    <path d="M8 36l10-12 8 8 14-18"
      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ─── Data ─── */
const teksLabels = ['7.3A', '7.3B', '7.4A', '7.4B', '7.6A', '8.4C', '8.7A', '8.8A']
const teksData   = [82, 61, 78, 70, 85, 74, 48, 67]
const teksColors = [
  'rgba(46,204,113,0.85)', 'rgba(196,98,45,0.85)',
  'rgba(46,204,113,0.85)', 'rgba(0,102,204,0.85)',
  'rgba(46,204,113,0.85)', 'rgba(0,102,204,0.85)',
  'rgba(196,98,45,0.85)',  'rgba(0,102,204,0.85)',
]

const activityData: ActivityItem[] = [
  { initials: 'CM', name: 'Carlos M.',  teks: 'TEKS 7.4A', topic: 'Proporciones y razones',  score: '9/10',    time: '5 min',  scoreColor: '#2ECC71', avatarColor: '#C4622D' },
  { initials: 'SR', name: 'Sofía R.',   teks: 'TEKS 8.7A', topic: 'Ecuaciones lineales',      score: '3/10',    time: '12 min', scoreColor: '#F4A261', avatarColor: '#0066CC' },
  { initials: 'LT', name: 'Luis T.',    teks: 'TEKS 7.6A', topic: 'Geometría · Tutor IA',     score: 'En curso',time: '18 min', scoreColor: 'rgba(255,255,255,0.45)', avatarColor: '#6B8C3E' },
  { initials: 'AP', name: 'Ana P.',     teks: 'TEKS 8.4C', topic: 'Álgebra y funciones',      score: '8/10',    time: '31 min', scoreColor: '#2ECC71', avatarColor: '#C4622D' },
  { initials: 'MV', name: 'Marco V.',   teks: 'TEKS 7.3B', topic: 'Números racionales',        score: '4/10',    time: '45 min', scoreColor: '#F4A261', avatarColor: '#0066CC' },
]

/* ─── Component ─── */
const TeacherDashboard = () => {
  const { user, signOut } = useAuth()
  const { lang } = useLang()
  const chartRef          = useRef<HTMLCanvasElement>(null)
  const chartInstance     = useRef<Chart | null>(null)

  const t = {
    greeting:  lang === 'es' ? 'Buenos días, maestra'                        : 'Good morning, teacher',
    subtitle:  lang === 'es' ? 'Aquí está el resumen de tu clase de hoy'      : "Here's your class summary for today",
    students:  lang === 'es' ? 'Alumnos activos'                              : 'Active students',
    problems:  lang === 'es' ? 'Problemas resueltos'                          : 'Problems solved',
    average:   lang === 'es' ? 'Promedio general'                             : 'Overall average',
    teksTitle: lang === 'es' ? 'Progreso por TEKS'                            : 'Progress by TEKS',
    actTitle:  lang === 'es' ? 'Actividad reciente'                           : 'Recent activity',
    signOut:   lang === 'es' ? 'Cerrar sesión'                                : 'Sign out',
    grade:     lang === 'es' ? '7° y 8° Grado · STAAR 2026'                  : '7th & 8th Grade · STAAR 2026',
  }

  const stats: StatCard[] = [
    { label: t.students, value: '28',    change: '+3 esta semana',       color: '#C4622D', icon: <IconStudents /> },
    { label: t.problems, value: '1,247', change: '+89 hoy',              color: '#0066CC', icon: <IconProblems /> },
    { label: t.average,  value: '74%',   change: '+6% vs mes anterior',  color: '#2ECC71', icon: <IconAverage  /> },
  ]

  /* Chart */
  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: teksLabels,
        datasets: [{
          data: teksData,
          backgroundColor: teksColors,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.raw}%` } },
        },
        scales: {
          y: {
            min: 0, max: 100,
            ticks: { callback: (v) => `${v}%`, font: { size: 10 }, color: 'rgba(255,255,255,0.4)' },
            grid:  { color: 'rgba(255,255,255,0.06)' },
            border: { display: false },
          },
          x: {
            ticks: { font: { size: 10 }, color: 'rgba(255,255,255,0.5)' },
            grid:  { display: false },
            border: { display: false },
          },
        },
      },
    })

    return () => { chartInstance.current?.destroy() }
  }, [])

  /* Helpers */
  const today = new Date().toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const initials = user?.displayName
    ?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? 'MG'

  return (
    <div style={s.page}>

      {/* ── Top bar ── */}
      <header style={s.topbar}>
        <div style={s.logoPill}>
          <img src={logoAI} alt="AI Munoz Constanzo" style={s.logoImg} />
        </div>

        <div style={s.topRight}>
          <div style={s.teacherInfo}>
            <p style={s.teacherName}>{user?.displayName ?? 'Maestra'}</p>
            <small style={s.teacherSub}>{t.grade}</small>
          </div>
          <div style={s.avatar}>{initials}</div>
          <button style={s.signOutBtn} onClick={signOut}>{t.signOut}</button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={s.content}>

        {/* Greeting */}
        <div style={s.helloBar}>
          <div>
            <h1 style={s.helloTitle}>{t.greeting}</h1>
            <p style={s.helloSub}>{t.subtitle}</p>
          </div>
          <div style={s.datePill}>{today}</div>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {stats.map((st) => (
            <div key={st.label} style={{ ...s.statCard, background: st.color }}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statValue}>{st.value}</div>
              <div style={s.statChange}>{st.change}</div>
              <div style={s.statIcon}>{st.icon}</div>
            </div>
          ))}
        </div>

        {/* Chart + Activity */}
        <div style={s.mainGrid}>

          {/* TEKS Chart */}
          <div style={s.panel}>
            <div style={s.panelTitle}>{t.teksTitle}</div>
            <div style={s.chartWrap}>
              <canvas ref={chartRef} />
            </div>
          </div>

          {/* Activity */}
          <div style={s.panel}>
            <div style={s.panelTitle}>{t.actTitle}</div>
            {activityData.map((item) => (
              <div key={item.name} style={s.actItem}>
                <div style={{ ...s.actAvatar, background: item.avatarColor }}>
                  {item.initials}
                </div>
                <div style={s.actBody}>
                  <div style={s.actName}>{item.name}</div>
                  <div style={s.actDesc}>{item.teks} · {item.topic}</div>
                </div>
                <div style={s.actRight}>
                  <div style={{ ...s.actScore, color: item.scoreColor }}>{item.score}</div>
                  <div style={s.actTime}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}

/* ─── Styles ─── */
const s: Record<string, React.CSSProperties> = {
  page: {
    background: '#1A2744',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  /* Topbar */
  topbar: {
    padding: '0.85rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
  },
  logoPill: {
    background: '#FFFFFF',
    borderRadius: 10,
    padding: '6px 14px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  logoImg: {
    height: 40,
    width: 'auto',
    display: 'block',
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  teacherInfo: {
    textAlign: 'right',
  },
  teacherName: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 500,
    margin: 0,
  },
  teacherSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#C4622D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  signOutBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    padding: '6px 12px',
    cursor: 'pointer',
  },

  /* Content */
  content: {
    padding: '2rem',
    maxWidth: 1100,
    margin: '0 auto',
  },
  helloBar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: 12,
  },
  helloTitle: {
    fontSize: 26,
    fontWeight: 500,
    color: '#FFFFFF',
    margin: 0,
  },
  helloSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
    marginBottom: 0,
  },
  datePill: {
    background: 'rgba(255,255,255,0.07)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    whiteSpace: 'nowrap',
  },

  /* Stats */
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
    gap: 12,
    marginBottom: '1.5rem',
  },
  statCard: {
    borderRadius: 14,
    padding: '1.25rem',
    position: 'relative',
    overflow: 'hidden',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 500,
    color: '#FFFFFF',
    lineHeight: 1,
  },
  statChange: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  statIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    opacity: 0.15,
  },

  /* Main grid */
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  panel: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '1.25rem',
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chartWrap: {
    position: 'relative',
    width: '100%',
    height: 220,
  },

  /* Activity */
  actItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '0.5px solid rgba(255,255,255,0.07)',
  },
  actAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 500,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  actBody: {
    flex: 1,
  },
  actName: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 500,
  },
  actDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  actRight: {
    textAlign: 'right',
    flexShrink: 0,
  },
  actScore: {
    fontSize: 13,
    fontWeight: 500,
  },
  actTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
}

export default TeacherDashboard
