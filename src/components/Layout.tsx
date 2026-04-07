import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, Brain, BookOpen, BarChart2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";


const teacherNav = [
  { name: "Dashboard",       path: "/teacher/dashboard", icon: LayoutDashboard },
  { name: "Tutor IA",        path: "/teacher/tutor",     icon: Brain },
  { name: "Banco Problemas", path: "/teacher/problems",  icon: BookOpen },
  { name: "Reportes",        path: "/teacher/reports",   icon: BarChart2 },
];

const studentNav = [
  { name: "Tutor IA",  path: "/student/tutor",  icon: Brain },
  { name: "Reportes", path: "/student/reports", icon: BarChart2 },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === "teacher" ? teacherNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0F1A2E", color: "#E8E8E8" }}>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: "#0F1A2E", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{fontWeight:700,fontSize:16,color:"#C4622D"}}>GuapoMathTutor Pro</span>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-200
        md:relative md:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `} style={{ background: "#0B1526", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="hidden md:flex items-center px-6 py-5">
          <span style={{fontWeight:700,fontSize:18,color:"#C4622D"}}>GuapoMathTutor Pro</span>
        </div>

        <nav className="flex-1 px-3 py-4 mt-14 md:mt-0 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                style={{
                  background: active ? "rgba(196,98,45,0.15)" : "transparent",
                  color: active ? "#C4622D" : "rgba(232,232,232,0.6)",
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? "3px solid #C4622D" : "3px solid transparent",
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 mb-3 px-2">
              {user.photoURL ? (
                <img src={user.photoURL} className="h-9 w-9 rounded-full object-cover" alt="" />
              ) : (
                <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: "#C4622D", color: "#fff" }}>
                  {user.displayName?.charAt(0) ?? "U"}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate" style={{ color: "#E8E8E8" }}>
                  {user.displayName}
                </p>
                <p className="text-xs truncate" style={{ color: "rgba(232,232,232,0.4)" }}>
                  {user.role === "teacher" ? "Maestro" : "Alumno"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ color: "#e05252" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(224,82,82,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden pt-14 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}
