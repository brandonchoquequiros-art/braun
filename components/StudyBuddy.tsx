import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, MessageSquare, Radio, BrainCircuit } from 'lucide-react';
import { sendChatMessage, LiveSessionClient } from '../services/geminiService';
import { ChatMessage } from '../types';

const StudyBuddy: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // Text Chat State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "¡Hola! Soy tu Tutor IA. Pregúntame sobre tus tareas o activa 'Pensamiento Profundo' para temas complejos.", timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Chat State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const liveClient = useRef<LiveSessionClient | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- TEXT CHAT HANDLERS ---
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = await sendChatMessage(history, newMsg.text, useThinking);
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: new Date() }]);

      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, text: fullResponse }];
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, hubo un error. Intenta de nuevo.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- VOICE CHAT HANDLERS ---
  
  useEffect(() => {
    if (!isLiveConnected || !canvasRef.current) return;
    let animationId: number;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, 300, 100);
      const bars = 20;
      const width = 300 / bars;
      
      ctx.fillStyle = '#60a5fa'; // Blue-400
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * 50 * (isLiveConnected ? 1 : 0); 
        const x = i * width;
        const y = 100 - height - 10;
        ctx.fillRect(x, y, width - 4, height + 5);
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isLiveConnected]);

  const toggleLive = async () => {
    if (isLiveConnected) {
      await liveClient.current?.disconnect();
      setIsLiveConnected(false);
    } else {
      liveClient.current = new LiveSessionClient();
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let nextStartTime = 0;
      
      liveClient.current.onAudioData = async (buffer) => {
         const audioBuffer = await audioCtx.decodeAudioData(buffer);
         const source = audioCtx.createBufferSource();
         source.buffer = audioBuffer;
         source.connect(audioCtx.destination);
         
         const now = audioCtx.currentTime;
         nextStartTime = Math.max(nextStartTime, now);
         source.start(nextStartTime);
         nextStartTime += audioBuffer.duration;
         setAudioLevel(Math.random()); 
      };

      await liveClient.current.connect();
      setIsLiveConnected(true);
    }
  };

  useEffect(() => {
    return () => {
      liveClient.current?.disconnect();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl animate-fade-in">
      {/* Header / Tabs */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setMode('text')}
          className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'bg-slate-700/50 text-blue-400' : 'text-slate-400 hover:bg-slate-700/30'}`}
        >
          <MessageSquare className="w-5 h-5" /> Chat de Texto
        </button>
        <button 
          onClick={() => setMode('voice')}
          className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'voice' ? 'bg-slate-700/50 text-pink-400' : 'text-slate-400 hover:bg-slate-700/30'}`}
        >
          <Mic className="w-5 h-5" /> Chat de Voz (Live)
        </button>
      </div>

      {/* TEXT MODE */}
      {mode === 'text' && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                  {msg.role === 'model' && msg.text === "" ? (
                    <span className="animate-pulse">Pensando...</span>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-700">
            <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${useThinking ? 'bg-purple-600' : 'bg-slate-600'}`} onClick={() => setUseThinking(!useThinking)}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${useThinking ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <BrainCircuit className="w-3 h-3" />
                    Pensamiento Profundo (Gemini 3 Pro)
                </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta sobre tu tarea..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* VOICE MODE */}
      {mode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isLiveConnected ? 'bg-pink-500/20 shadow-[0_0_50px_rgba(236,72,153,0.3)]' : 'bg-slate-700'}`}>
            <Radio className={`w-16 h-16 ${isLiveConnected ? 'text-pink-500 animate-pulse' : 'text-slate-500'}`} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isLiveConnected ? "Escuchando..." : "Iniciar Conversación"}
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              Practica tu pronunciación o haz preguntas orales con Gemini Live.
            </p>
          </div>

          <canvas ref={canvasRef} width={300} height={100} className="w-full max-w-xs h-24" />

          <button
            onClick={toggleLive}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${isLiveConnected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/20'}`}
          >
            {isLiveConnected ? <><MicOff className="w-6 h-6" /> Finalizar</> : <><Mic className="w-6 h-6" /> Iniciar Live</>}
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyBuddy;
