import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import LoginPage from "./components/auth/LoginPage";
import JoinPage from "./components/auth/JoinPage";
import TeacherDashboard from "./components/dashboard/TeacherDashboard";
import AITutor from "./components/tutor/AITutor";
import Reports from "./components/reports/Reports";
import ProblemBank from "./components/problems/ProblemBank";
function FullPageSpinner() {
  return (<div style={{ minHeight: "100vh", background: "#0F1A2E", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#E8E8E8" }}>Cargando...</span></div>);
}
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
function RedirectIfAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to={user.role === "teacher" ? "/teacher/dashboard" : "/student/tutor"} replace />;
  return children;
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/tutor" element={<AITutor />} />
          <Route path="/teacher/problems" element={<ProblemBank />} />
          <Route path="/teacher/reports" element={<Reports />} />
          <Route path="/student/tutor" element={<AITutor />} />
          <Route path="/student/reports" element={<Reports />} />
        </Route>
        <Route path="/join" element={<JoinPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
