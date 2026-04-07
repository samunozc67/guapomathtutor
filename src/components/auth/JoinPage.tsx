import { useAuth, STUDENT_CODE } from "../../contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function JoinPage() {
  const { signInWithGoogle, user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const code = params.get("code") ?? "";
  const isValid = code === STUDENT_CODE;

  useEffect(() => {
    if (user) navigate("/student/tutor");
  }, [user]);

  const handleJoin = async () => {
    if (!isValid) { setError("Código inválido. Pide el link correcto a tu maestro."); return; }
    await signInWithGoogle(true);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0F1A2E", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#1A2744", borderRadius:20, padding:40, maxWidth:420, width:"100%", textAlign:"center", border:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🧮</div>
        <h1 style={{ color:"#E8E8E8", fontSize:24, fontWeight:700, marginBottom:8 }}>GuapoMathTutor Pro</h1>
        <p style={{ color:"rgba(232,232,232,0.5)", fontSize:14, marginBottom:32 }}>Portal de Alumnos</p>

        {isValid ? (
          <>
            <div style={{ background:"rgba(46,204,113,0.1)", border:"1px solid #2ECC71", borderRadius:12, padding:16, marginBottom:24 }}>
              <p style={{ color:"#2ECC71", fontSize:14, margin:0 }}>✅ Código válido — Eres alumno de GuapoMathTutor</p>
            </div>
            <button onClick={handleJoin}
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:"#C4622D", color:"#fff", fontSize:16, fontWeight:600, cursor:"pointer" }}>
              Entrar con Google →
            </button>
          </>
        ) : (
          <>
            <div style={{ background:"rgba(224,82,82,0.1)", border:"1px solid #e05252", borderRadius:12, padding:16, marginBottom:24 }}>
              <p style={{ color:"#e05252", fontSize:14, margin:0 }}>❌ Código inválido. Pide el link correcto a tu maestro.</p>
            </div>
          </>
        )}
        {error && <p style={{ color:"#e05252", fontSize:13, marginTop:12 }}>{error}</p>}
      </div>
    </div>
  );
}
