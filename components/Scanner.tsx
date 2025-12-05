import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, Play, FileText } from 'lucide-react';
import { analyzeNotesAndCreateQuiz } from '../services/geminiService';
import { ScanResult } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset result on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      // Strip data:image/jpeg;base64, prefix
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const scanResult = await analyzeNotesAndCreateQuiz(base64Data, mimeType);
      setResult(scanResult);
      onScanComplete(scanResult);
    } catch (err) {
      console.error(err);
      alert("Error al analizar. Intenta con una imagen más clara.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          Escáner de Cuaderno
        </h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">
          Sube una foto de tus apuntes o tarea. Gemini extraerá los conceptos clave y creará un cuestionario de repaso automáticamente.
        </p>

        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-12 hover:border-blue-500 hover:bg-slate-700/30 transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center">
              <div className="bg-slate-700 p-4 rounded-full mb-4 group-hover:bg-blue-600/20 transition-colors">
                <Camera className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-lg font-medium text-slate-300">Toca para subir foto</p>
              <p className="text-sm text-slate-500 mt-2">Soporta JPG, PNG</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="relative rounded-xl overflow-hidden shadow-2xl max-h-96">
              <img src={image} alt="Uploaded notes" className="object-contain max-h-96 w-auto" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-slate-900/80 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {!result && (
              <button 
                onClick={handleScan}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Upload className="w-5 h-5" />}
                {loading ? 'Analizando...' : 'Analizar y Crear Cuestionario'}
              </button>
            )}
          </div>
        )}
      </div>

      {result && (
        <div className="animate-fade-in bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{result.title}</h3>
              <p className="text-slate-400">{result.summary}</p>
            </div>
            <div className="bg-green-500/10 text-green-400 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
            <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">¡Cuestionario Listo!</h4>
            <p className="text-slate-400 mb-6">Hemos generado {result.quiz.length} preguntas de repaso. Se ha guardado en tu biblioteca.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
