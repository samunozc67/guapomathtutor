import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Calculator, History, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
  const { user, signIn } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
        <div className="bg-blue-100 p-4 rounded-full mb-6">
          <Calculator className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Bienvenido a GuapoMathTutor Pro
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Tu tutor personal de matemáticas para el examen STAAR de 8.º grado.
          Sube una foto de tu problema y te guiaremos paso a paso para resolverlo.
        </p>
        <Button size="lg" onClick={signIn} className="text-lg px-8">
          Iniciar Sesión con Google
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Hola, {user.displayName} 👋</h1>
        <p className="text-slate-600 mt-2">¿Listo para practicar matemáticas hoy?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Nuevo Problema</CardTitle>
            <CardDescription>
              Sube una foto de un problema de matemáticas de 8.º grado y resuélvelo paso a paso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/tutor">
                Empezar Tutoría <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle>Tus Reportes</CardTitle>
            <CardDescription>
              Revisa los problemas que has resuelto anteriormente y tus áreas de mejora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/reports">
                Ver Historial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">¿Cómo funciona?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-4">1</div>
            <h3 className="font-medium text-slate-900 mb-2">Sube una foto</h3>
            <p className="text-sm text-slate-600">Toma una foto de tu problema de matemáticas del currículum STAAR.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-4">2</div>
            <h3 className="font-medium text-slate-900 mb-2">Resuelve paso a paso</h3>
            <p className="text-sm text-slate-600">El tutor te guiará. Tú haces los cálculos, nosotros te ayudamos si te equivocas.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-4">3</div>
            <h3 className="font-medium text-slate-900 mb-2">Obtén tu reporte</h3>
            <p className="text-sm text-slate-600">Al finalizar, recibe un resumen detallado con tus aciertos y errores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
