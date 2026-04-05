import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { History, Calendar, AlertCircle, CheckCircle2, Download } from "lucide-react";
import Markdown from "react-markdown";

type Session = {
  id: string;
  studentName: string;
  status: string;
  startTime: any;
  errorCount: number;
  summary: string;
};

export function Reports() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid),
          orderBy("startTime", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedSessions: Session[] = [];
        querySnapshot.forEach((doc) => {
          fetchedSessions.push({ id: doc.id, ...doc.data() } as Session);
        });
        setSessions(fetchedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user]);

  const downloadReport = (session: Session) => {
    const element = document.createElement("a");
    const date = session.startTime?.toDate ? session.startTime.toDate().toLocaleDateString() : 'Fecha desconocida';
    const file = new Blob([`Reporte de Tutoría - ${session.studentName}\nFecha: ${date}\nErrores: ${session.errorCount}\n\n${session.summary}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `reporte_${session.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!user) {
    return <div className="p-8 text-center">Por favor, inicia sesión para ver tus reportes.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando reportes...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <History className="h-8 w-8 text-blue-600" />
          Tus Reportes
        </h1>
        <p className="text-slate-600 mt-2">Revisa tu historial de problemas resueltos y tu progreso.</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50 border-dashed">
          <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aún no hay reportes</h3>
          <p className="text-slate-500">Resuelve tu primer problema en la sección Tutor para ver tu progreso aquí.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    {session.startTime?.toDate ? session.startTime.toDate().toLocaleDateString() : 'Fecha reciente'}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-0.5 rounded-full ${
                    session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {session.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {session.status === 'completed' ? 'Completado' : 'En progreso'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                    <AlertCircle className="h-3 w-3" />
                    {session.errorCount} errores
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadReport(session)}>
                  <Download className="h-4 w-4 mr-2" /> Descargar
                </Button>
              </div>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  {session.summary ? (
                    <Markdown>{session.summary}</Markdown>
                  ) : (
                    <p className="text-slate-500 italic">No hay resumen disponible para esta sesión.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
