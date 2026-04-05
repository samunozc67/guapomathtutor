import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Upload, Send, Mic, MicOff, CheckCircle2, AlertCircle, Copy, Download, ImageIcon, X } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cleanMathText = (text: string) => {
  let cleaned = text;
  
  // Replace specific variables with $
  cleaned = cleaned.replace(/\$x\$/gi, 'X');
  cleaned = cleaned.replace(/\$y\$/gi, 'Y');
  cleaned = cleaned.replace(/\$m\$/gi, 'M');
  
  // Remove all remaining $ signs
  cleaned = cleaned.replace(/\$/g, '');
  
  // Replace \frac{a}{b} with (a) / (b)
  cleaned = cleaned.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1) / ($2)');
  
  // Replace subscripts
  cleaned = cleaned.replace(/y_2/gi, 'Y2');
  cleaned = cleaned.replace(/y_1/gi, 'Y1');
  cleaned = cleaned.replace(/x_2/gi, 'X2');
  cleaned = cleaned.replace(/x_1/gi, 'X1');
  
  // Remove remaining LaTeX brackets
  cleaned = cleaned.replace(/\\\(/g, '').replace(/\\\)/g, '').replace(/\\\[/g, '').replace(/\\\]/g, '');
  
  return cleaned;
};

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
  isError?: boolean;
};

export function Tutor() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [summary, setSummary] = useState("");
  const [showMobileImage, setShowMobileImage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
      startTutoringSession(base64String);
    };
    reader.readAsDataURL(file);
  };

  const startTutoringSession = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      // Create a new chat session with system instructions
      chatRef.current = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: `Quiero que crees una aplicación web completa llamada GuapoMathTutor Pro.
Su objetivo es, mediante la foto de un problema de matemáticas de 8.º grado del currículum de la prueba estatal STAAR del estado de Texas, ayudar a un usuario a responder la pregunta, paso a paso, solo después de recibir instrucción del usuario, vía escrita o vía voz. Si el usuario no sabe qué hacer y dice "necesito ayuda", la app le dirá el paso necesario para comenzar la solución del problema o indicará el próximo paso en la solución del problema. La solución no puede saltarse ni un solo paso que implique realizar operaciones matemáticas, las cuales el usuario deberá realizar de forma independiente. Cuando haya realizado la operación matemática o formulado la fórmula para solucionar el problema, el usuario deberá escribir la respuesta y la app la comparará con la correcta. Si hay algún error, la app deberá explicarlo antes de continuar al siguiente paso. Al terminar de resolver el problema mostrado en una foto, se generará un resumen de los pasos realizados, incluidos los errores. El informe debe incluir el nombre del estudiante. Todo debe realizarse desde una sola plataforma, con una experiencia moderna, clara y totalmente funcional. Cuando el problema esté completamente resuelto, debes incluir la palabra "PROBLEM_SOLVED" al final de tu mensaje.
REGLA DE FORMATO MUY IMPORTANTE: Escribe los números, fórmulas y operaciones matemáticas de forma limpia y simple. ESTÁ ESTRICTAMENTE PROHIBIDO usar formato LaTeX (prohibido usar $, $$, \\(, \\), \\[, \\], \\frac). NO agregues símbolos extraños anexados a las letras o números. Usa texto plano claro. Por ejemplo, en lugar de escribir $m = \\frac{y_2 - y_1}{x_2 - x_1}$, debes escribir M = (Y_2 - Y_1) / (X_2 - X_1). En lugar de $x$ o $y$, escribe simplemente X o Y en mayúsculas.`,
        }
      });

      // Extract base64 data without the data:image/jpeg;base64, prefix
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(';')[0].split(':')[1];

      const response = await chatRef.current.sendMessage({
        message: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          "Aquí está mi problema de matemáticas. Por favor, ayúdame a resolverlo paso a paso."
        ]
      });

      setMessages([
        { id: Date.now().toString(), role: "model", text: response.text }
      ]);
    } catch (error: any) {
      console.error("Error starting session:", error);
      let errorMessage = "Hubo un error al analizar la imagen. Por favor, intenta subirla de nuevo.";
      
      if (error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota")) {
        errorMessage = "⚠️ Has excedido el límite de uso gratuito de la Inteligencia Artificial (Error 429: Cuota excedida). Por favor, espera un momento antes de volver a intentarlo o revisa tu plan en Google AI Studio.";
      }
      
      setMessages([
        { id: Date.now().toString(), role: "model", text: errorMessage, isError: true }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing || !chatRef.current) return;

    const userText = input.trim();
    setInput("");
    
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsProcessing(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      let modelText = response.text;
      
      // Check if the model indicates the student made an error (heuristic: looking for correction words)
      // A better way is to ask the model to output a specific JSON, but for natural chat we can use heuristics
      // or just rely on the final summary. We'll track explicit "incorrecto" or "error".
      const isError = modelText.toLowerCase().includes("incorrecto") || modelText.toLowerCase().includes("error") || modelText.toLowerCase().includes("no es correcto");
      if (isError) {
        setErrorCount(prev => prev + 1);
      }

      let isCompleted = false;
      if (modelText.includes("PROBLEM_SOLVED")) {
        isCompleted = true;
        modelText = modelText.replace("PROBLEM_SOLVED", "").trim();
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: "model", text: modelText, isError }]);

      if (isCompleted) {
        await finishSession();
      }

    } catch (error: any) {
      console.error("Error sending message:", error);
      let errorMessage = "Lo siento, hubo un problema de conexión. ¿Puedes repetir eso?";
      
      if (error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota")) {
        errorMessage = "⚠️ Has excedido el límite de uso gratuito de la Inteligencia Artificial (Error 429: Cuota excedida). Por favor, espera un momento antes de volver a intentarlo o revisa tu plan en Google AI Studio.";
      }
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "model", text: errorMessage, isError: true }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const finishSession = async () => {
    setSessionCompleted(true);
    setIsProcessing(true);
    try {
      // Ask Gemini to generate a summary
      const summaryResponse = await chatRef.current.sendMessage({
        message: `El problema ha sido resuelto. Por favor, genera un resumen detallado de los pasos realizados para resolver este problema, incluyendo los errores que cometió el estudiante y cómo se corrigieron. El nombre del estudiante es ${user?.displayName || 'Estudiante'}. Formatea el resumen en Markdown.`
      });
      
      const finalSummary = summaryResponse.text;
      setSummary(finalSummary);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, "sessions"), {
          userId: user.uid,
          studentName: user.displayName || "Estudiante",
          status: "completed",
          startTime: serverTimestamp(), // Ideally we'd track actual start time
          errorCount: errorCount,
          summary: finalSummary,
          transcript: messages.map(m => ({ role: m.role, text: m.text, timestamp: new Date().toISOString() }))
        });
      }
    } catch (error) {
      console.error("Error finishing session:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice Recognition (Web Speech API)
  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      // Stop logic handled by the API onend
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert("No se pudo acceder al micrófono. Por favor, permite el acceso al micrófono en tu navegador (arriba a la izquierda en la barra de direcciones).");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Te recomendamos usar Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    const element = document.createElement("a");
    const file = new Blob([`Reporte de Tutoría - ${user?.displayName}\n\n${summary}\n\n--- Transcripción ---\n${messages.map(m => `${m.role === 'user' ? 'Tú' : 'Tutor'}: ${m.text}`).join('\n\n')}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `reporte_matematicas_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!user) {
    return <div className="p-8 text-center">Por favor, inicia sesión para usar el tutor.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tutor Interactivo</h1>
          <p className="text-slate-600">Sube un problema y resolvámolo juntos.</p>
        </div>
        {sessionCompleted && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => copyToClipboard(summary)}>
              <Copy className="h-4 w-4 mr-2" /> Copiar Resumen
            </Button>
            <Button onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" /> Descargar Reporte
            </Button>
          </div>
        )}
      </div>

      {!image ? (
        <Card className="flex-1 flex flex-col items-center justify-center border-dashed border-2 border-slate-300 bg-slate-50">
          <div className="text-center p-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Sube tu problema de matemáticas</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Toma una foto clara de tu problema del examen STAAR (8.º grado) y súbela aquí para comenzar.
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} size="lg">
              Seleccionar Imagen
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative">
          {/* Mobile Image Modal */}
          {showMobileImage && (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                onClick={() => setShowMobileImage(false)}
              >
                <X className="h-8 w-8" />
              </Button>
              <img src={image} alt="Problema" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            </div>
          )}

          {/* Image Preview Sidebar (Desktop) */}
          <div className="hidden md:flex w-1/3 flex-col gap-4">
            <Card className="p-2 bg-slate-100 overflow-hidden flex-shrink-0 relative">
              <img src={image} alt="Problema" className="w-full h-auto rounded object-contain max-h-[300px] md:max-h-none" />
            </Card>
            
            {sessionCompleted && summary && (
              <Card className="flex-1 overflow-y-auto p-4 bg-green-50 border-green-200">
                <h3 className="font-bold text-green-800 mb-2 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" /> Resumen de la Sesión
                </h3>
                <div className="prose prose-sm prose-green max-w-none">
                  <Markdown>{summary}</Markdown>
                </div>
              </Card>
            )}
          </div>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-slate-200 md:hidden flex justify-center bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setShowMobileImage(true)}>
                <ImageIcon className="h-4 w-4 mr-2" /> Ver Problema
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : msg.isError 
                          ? "bg-red-200 text-black border border-red-400 rounded-bl-none"
                          : "bg-yellow-400 text-black font-medium rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.role === "model" && msg.isError && (
                      <div className="flex items-center gap-1 text-red-700 font-bold mb-1 text-sm">
                        <AlertCircle className="h-4 w-4" /> Corrección
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none text-black">
                      <Markdown>{cleanMathText(msg.text)}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleListening}
                  disabled={isProcessing || sessionCompleted}
                  className="flex-shrink-0"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isProcessing || sessionCompleted}
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || isProcessing || sessionCompleted} className="flex-shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
