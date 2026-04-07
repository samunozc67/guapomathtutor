import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { useLang } from "../../contexts/LangContext"

Chart.register(...registerables)

interface ActivityItem {
  initials: string; name: string; teks: string; topic: string
  score: string; time: string; scoreColor: string; avatarColor: string
}

const IconStudents = () => <svg viewBox="0 0 48 48" fill="none" width={48} height={48}><circle cx="24" cy="16" r="8" fill="white" /><path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>
const IconProblems = () => <svg viewBox="0 0 48 48" fill="none" width={48} height={48}><rect x="8" y="28" width="8" height="12" rx="2" fill="white" /><rect x="20" y="20" width="8" height="20" rx="2" fill="white" /><rect x="32" y="10" width="8" height="30" rx="2" fill="white" /></svg>
const IconAverage  = () => <svg viewBox="0 0 48 48" fill="none" width={48} height={48}><path d="M8 36l10-12 8 8 14-18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>

const teksLabels = ['7.3A','7.3B','7.4A','7.4B','7.6A','8.4C','8.7A','8.8A']
const teksData   = [82,61,78,70,85,74,48,67]
const teksColors = ['rgba(46,204,113,0.85)','rgba(196,98,45,0.85)','rgba(46,204,113,0.85)','rgba(0,102,204,0.85)','rgba(46,204,113,0.85)','rgba(0,102,204,0.85)','rgba(196,98,45,0.85)','rgba(0,102,204,0.85)']

const activityData: ActivityItem[] = [
  { initials:'CM', name:'Carlos M.',  teks:'TEKS 7.4A', topic:'Proporciones y razones', score:'9/10',     time:'5 min',  scoreColor:'#2ECC71', avatarColor:'#C4622D' },
  { initials:'SR', name:'Sofía R.',   teks:'TEKS 8.7A', topic:'Ecuaciones lineales',    score:'3/10',     time:'12 min', scoreColor:'#F4A261', avatarColor:'#0066CC' },
  { initials:'LT', name:'Luis T.',    teks:'TEKS 7.6A', topic:'Geometría · Tutor IA',   score:'En curso', time:'18 min', scoreColor:'rgba(255,255,255,0.45)', avatarColor:'#6B8C3E' },
  { initials:'AP', name:'Ana P.',     teks:'TEKS 8.4C', topic:'Álgebra y funciones',    score:'8/10',     time:'31 min', scoreColor:'#2ECC71', avatarColor:'#C4622D' },
  { initials:'MV', name:'Marco V.',   teks:'TEKS 7.3B', topic:'Números racionales',      score:'4/10',     time:'45 min', scoreColor:'#F4A261', avatarColor:'#0066CC' },
]

const TeacherDashboard = () => {
  const { lang } = useLang()
  const chartRef      = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const today = new Date().toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  })

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: { labels: teksLabels, datasets: [{ data: teksData, backgroundColor: teksColors, borderRadius: 6, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.raw}%` } } },
        scales: {
          y: { min:0, max:100, ticks: { callback:(v) => `${v}%`, font:{size:10}, color:'rgba(255,255,255,0.4)' }, grid:{color:'rgba(255,255,255,0.06)'}, border:{display:false} },
          x: { ticks: { font:{size:10}, color:'rgba(255,255,255,0.5)' }, grid:{display:false}, border:{display:false} },
        },
      },
    })
    return () => { chartInstance.current?.destroy() }
  }, [])

  return (
    <div style={{ fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:500, color:'#FFFFFF', margin:0 }}>
            {lang === 'es' ? 'Buenos días, maestra' : 'Good morning, teacher'}
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginTop:4, marginBottom:0 }}>
            {lang === 'es' ? 'Aquí está el resumen de tu clase de hoy' : "Here's your class summary for today"}
          </p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.07)', border:'0.5px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'6px 14px', fontSize:12, color:'rgba(255,255,255,0.6)', whiteSpace:'nowrap' }}>
          {today}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12, marginBottom:'1.5rem' }}>
        {[
          { label: lang==='es'?'Alumnos activos':'Active students', value:'28',    change:'+3 esta semana',      color:'#C4622D', icon:<IconStudents /> },
          { label: lang==='es'?'Problemas resueltos':'Problems solved', value:'1,247', change:'+89 hoy',             color:'#0066CC', icon:<IconProblems /> },
          { label: lang==='es'?'Promedio general':'Overall average', value:'74%',   change:'+6% vs mes anterior', color:'#2ECC71', icon:<IconAverage  /> },
        ].map((st) => (
          <div key={st.label} style={{ borderRadius:14, padding:'1.25rem', position:'relative', overflow:'hidden', background:st.color }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>{st.label}</div>
            <div style={{ fontSize:32, fontWeight:500, color:'#FFFFFF', lineHeight:1 }}>{st.value}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:6 }}>{st.change}</div>
            <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', opacity:0.15 }}>{st.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'1.25rem' }}>
          <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:'1.1rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            {lang==='es'?'Progreso por TEKS':'Progress by TEKS'}
          </div>
          <div style={{ position:'relative', width:'100%', height:220 }}>
            <canvas ref={chartRef} />
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'1.25rem' }}>
          <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:'1.1rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            {lang==='es'?'Actividad reciente':'Recent activity'}
          </div>
          {activityData.map((item) => (
            <div key={item.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, color:'#FFFFFF', flexShrink:0, background:item.avatarColor }}>{item.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'#FFFFFF', fontWeight:500 }}>{item.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{item.teks} · {item.topic}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:item.scoreColor }}>{item.score}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
