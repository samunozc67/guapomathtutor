import { useState, useMemo, useRef } from "react";
import { useLang } from "../../contexts/LangContext";
import { useNavigate } from "react-router-dom";

interface Problem {
  id: string; teks: string; grade: number;
  difficulty: "easy" | "medium" | "hard";
  category: string; question: string;
  options?: string[]; answer?: string; explanation?: string;
}

const MOCK: Problem[] = [
  { id:"1", teks:"7.4A", grade:7, difficulty:"easy", category:"Algebra", question:"Si 3x + 7 = 22, ¿cuál es el valor de x?", options:["x=3","x=5","x=7","x=9"], answer:"x=5", explanation:"Resta 7: 3x=15. Divide entre 3: x=5." },
  { id:"2", teks:"7.6G", grade:7, difficulty:"medium", category:"Probability", question:"Bolsa con 4 rojas y 6 azules. ¿Probabilidad de roja?", options:["2/5","3/5","1/4","2/3"], answer:"2/5", explanation:"P=4/10=2/5." },
  { id:"3", teks:"8.4B", grade:8, difficulty:"medium", category:"Functions", question:"Pendiente por (2,3) y (6,11)?", options:["m=1","m=2","m=3","m=4"], answer:"m=2", explanation:"m=(11-3)/(6-2)=2." },
  { id:"4", teks:"8.8C", grade:8, difficulty:"hard", category:"Geometry", question:"Catetos 6cm y 8cm. Hipotenusa?", options:["10cm","12cm","14cm","8cm"], answer:"10cm", explanation:"c2=36+64=100. c=10." },
  { id:"5", teks:"7.9A", grade:7, difficulty:"easy", category:"Geometry", question:"Area triangulo base 10 altura 6.", options:["30cm2","60cm2","16cm2","15cm2"], answer:"30cm2", explanation:"A=(10x6)/2=30." },
];

const DC: Record<string,{bg:string,color:string}> = {
  easy:{bg:"rgba(46,204,113,0.15)",color:"#2ECC71"},
  medium:{bg:"rgba(196,98,45,0.15)",color:"#C4622D"},
  hard:{bg:"rgba(224,82,82,0.15)",color:"#e05252"},
};

export default function ProblemBank() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>(MOCK);
  const [search, setSearch] = useState("");
  const [gradeF, setGradeF] = useState<number|null>(null);
  const [diffF, setDiffF] = useState<string|null>(null);
  const [selected, setSelected] = useState<Problem|null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => problems.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.teks.toLowerCase().includes(q) || p.question.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      && (!gradeF || p.grade === gradeF)
      && (!diffF || p.difficulty === diffF);
  }), [problems, search, gradeF, diffF]);

  const handlePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(lang==="es" ? "Analizando PDF..." : "Analyzing PDF...");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 4000,
            messages: [{
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                { type: "text", text: `Extrae todos los problemas matematicos de este PDF y devuelve UNICAMENTE un array JSON valido. No incluyas caracteres especiales, simbolos matematicos, ni acentos en el JSON. Usa texto ASCII simple. Formato exacto:
[{"id":"1","teks":"8.2A","grade":8,"difficulty":"easy","category":"Algebra","question":"pregunta aqui","options":["A","B","C","D"],"answer":"A","explanation":"explicacion aqui"}]
Reglas: difficulty es easy, medium o hard. grade es 7 u 8. Si no hay opciones usa []. Devuelve SOLO el JSON, sin texto adicional, sin backticks, sin markdown.` }
              ]
            }]
          })
        });
        const data = await res.json();
        console.log("API response:", data);
        const text = data.content?.[0]?.text ?? "";
        console.log("Text from Claude:", text.substring(0, 200));
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) throw new Error("No JSON array found");
        const parsed: Problem[] = JSON.parse(match[0]);
        const withIds = parsed.map((p,i) => ({...p, id:`pdf-${Date.now()}-${i}`}));
        setProblems(prev => [...prev, ...withIds]);
        setMsg(`✅ ${withIds.length} problemas agregados`);
      } catch(err) {
        console.error("Upload error:", err);
        setMsg("❌ Error al procesar el PDF");
      }
      setUploading(false);
      setTimeout(() => setMsg(""), 5000);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSolve = (p: Problem) => {
    sessionStorage.setItem("tutorProblem", JSON.stringify(p));
    navigate("/teacher/tutor");
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:600, color:"#E8E8E8", margin:0 }}>{lang==="es"?"Banco de Problemas":"Problem Bank"}</h1>
          <p style={{ fontSize:13, color:"rgba(232,232,232,0.45)", marginTop:4 }}>STAAR · 7mo y 8vo grado</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {msg && <span style={{ fontSize:13, color:"rgba(232,232,232,0.7)" }}>{msg}</span>}
          <input ref={fileRef} type="file" accept=".pdf" style={{ display:"none" }} onChange={handlePDF} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#C4622D", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            📄 {uploading ? "Procesando..." : lang==="es"?"Subir PDF":"Upload PDF"}
          </button>
        </div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={lang==="es"?"Buscar TEKS, tema...":"Search TEKS, topic..."}
          style={{ flex:1, minWidth:200, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#E8E8E8", fontSize:13, outline:"none" }} />
        {[null,7,8].map(g=>(
          <button key={g??"all"} onClick={()=>setGradeF(g)}
            style={{ padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:gradeF===g?"#C4622D":"rgba(255,255,255,0.05)", color:"#E8E8E8", fontSize:13, cursor:"pointer" }}>
            {g===null?(lang==="es"?"Todos":"All"):`${g}°`}
          </button>
        ))}
        {[null,"easy","medium","hard"].map(d=>(
          <button key={d??"alld"} onClick={()=>setDiffF(d)}
            style={{ padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:diffF===d?"#0066CC":"rgba(255,255,255,0.05)", color:"#E8E8E8", fontSize:13, cursor:"pointer" }}>
            {d===null?(lang==="es"?"Dificultad":"Difficulty"):d}
          </button>
        ))}
      </div>

      <p style={{ fontSize:12, color:"rgba(232,232,232,0.4)", marginBottom:16 }}>{filtered.length} {lang==="es"?"problemas":"problems"}</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {filtered.map(p=>{
          const dc=DC[p.difficulty]??DC.medium;
          return (
            <div key={p.id} onClick={()=>setSelected(p)}
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:18, cursor:"pointer", display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(0,102,204,0.2)", color:"#4d9de0" }}>{p.teks}</span>
                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:dc.bg, color:dc.color }}>{p.difficulty}</span>
                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(255,255,255,0.06)", color:"rgba(232,232,232,0.5)" }}>{p.grade}°</span>
              </div>
              <p style={{ fontSize:14, color:"#E8E8E8", lineHeight:1.6, margin:0, fontWeight:500 }}>{p.question}</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize:11, color:"rgba(232,232,232,0.4)" }}>{p.category}</span>
                <button onClick={e=>{e.stopPropagation();handleSolve(p);}}
                  style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#C4622D", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  {lang==="es"?"Resolver →":"Solve →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div onClick={()=>setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#1A2744", borderRadius:18, padding:28, maxWidth:540, width:"100%", maxHeight:"90vh", overflowY:"auto", border:"1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ display:"flex", gap:6 }}>
                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(0,102,204,0.2)", color:"#4d9de0" }}>{selected.teks}</span>
                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:DC[selected.difficulty]?.bg, color:DC[selected.difficulty]?.color }}>{selected.difficulty}</span>
              </div>
              <button onClick={()=>setSelected(null)} style={{ border:"none", background:"rgba(255,255,255,0.1)", color:"#E8E8E8", width:30, height:30, borderRadius:"50%", cursor:"pointer" }}>✕</button>
            </div>
            <p style={{ fontSize:17, fontWeight:600, color:"#E8E8E8", lineHeight:1.6, marginBottom:16 }}>{selected.question}</p>
            {selected.options && selected.options.length>0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {selected.options.map(opt=>(
                  <div key={opt} style={{ padding:"12px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", color:"#E8E8E8", fontSize:14 }}>{opt}</div>
                ))}
              </div>
            )}
            {selected.explanation && (
              <div style={{ background:"rgba(46,204,113,0.1)", borderLeft:"3px solid #2ECC71", borderRadius:"0 10px 10px 0", padding:"12px 16px", fontSize:14, color:"#2ECC71", marginBottom:16 }}>
                💡 {selected.explanation}
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={()=>handleSolve(selected)} style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"#C4622D", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                {lang==="es"?"Resolver con Tutor IA →":"Solve with AI Tutor →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
