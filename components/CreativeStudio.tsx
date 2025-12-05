import React, { useState } from 'react';
import { Image, Video, Wand2, RefreshCw, Upload, Download, Key } from 'lucide-react';
import { generateImage, editImage, generateVideo } from '../services/geminiService';
import { AspectRatio, ImageResolution } from '../types';

const CreativeStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'video'>('generate');
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Options
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [resolution, setResolution] = useState<ImageResolution>(ImageResolution.RES_1K);

  // Helper to ensure API Key is selected
  const ensureApiKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.hasSelectedApiKey) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        if (!hasKey) {
            await aiStudio.openSelectKey();
            // Wait a moment for the key to register if the user selects it instantly
            return new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    return Promise.resolve();
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    
    await ensureApiKey(); // Check key before generation

    setLoading(true);
    setResultImage(null);
    try {
      const img = await generateImage(prompt, resolution, aspectRatio);
      setResultImage(img);
    } catch (e: any) {
      console.error(e);
      const msg = e.message || "";
      if (msg.includes("permission denied") || msg.includes("403")) {
          alert("Permiso denegado. Por favor selecciona una API Key válida con acceso a Gemini Pro Vision.");
          const aiStudio = (window as any).aistudio;
          if (aiStudio) await aiStudio.openSelectKey();
      } else {
          alert("Generación fallida. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!uploadedImage || !prompt) return;
    setLoading(true);
    try {
      // Strip header
      const base64 = uploadedImage.split(',')[1];
      const img = await editImage(base64, prompt);
      setResultImage(img);
    } catch (e) {
      alert("Edición fallida. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideo = async () => {
    if (!prompt) return;
    
    await ensureApiKey(); // Check key before generation

    setLoading(true);
    setResultVideo(null);
    try {
      const vidUrl = await generateVideo(prompt, aspectRatio);
      setResultVideo(vidUrl);
    } catch (e: any) {
        console.error(e);
        if (e.message && (e.message.includes("permission denied") || e.message.includes("403"))) {
             alert("Error de permisos. Asegúrate de seleccionar una API Key válida.");
             const aiStudio = (window as any).aistudio;
             if (aiStudio) await aiStudio.openSelectKey();
        } else {
             alert("Error al generar video.");
        }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <button 
            onClick={() => { setActiveTab('generate'); setPrompt(''); setResultImage(null); }}
            className={`flex-1 min-w-[150px] p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${activeTab === 'generate' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
        >
            <Image className="w-6 h-6" />
            <span className="font-semibold text-sm">Generar Imagen</span>
        </button>
        <button 
            onClick={() => { setActiveTab('edit'); setPrompt(''); setResultImage(null); }}
            className={`flex-1 min-w-[150px] p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${activeTab === 'edit' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
        >
            <Wand2 className="w-6 h-6" />
            <span className="font-semibold text-sm">Editar Imagen</span>
        </button>
        <button 
            onClick={() => { setActiveTab('video'); setPrompt(''); setResultVideo(null); }}
            className={`flex-1 min-w-[150px] p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${activeTab === 'video' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
        >
            <Video className="w-6 h-6" />
            <span className="font-semibold text-sm">Video Veo</span>
        </button>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CONTROLS */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Instrucción (Prompt)</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={activeTab === 'edit' ? "ej. Añade un filtro retro, elimina el fondo..." : "Describe lo que quieres crear..."}
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                </div>

                {activeTab === 'edit' && (
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Imagen de Referencia</label>
                        <div className="relative">
                            <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="bg-slate-900 border border-dashed border-slate-600 rounded-xl p-4 text-center hover:bg-slate-800 transition-colors">
                                {uploadedImage ? (
                                    <img src={uploadedImage} alt="Reference" className="h-20 mx-auto object-contain" />
                                ) : (
                                    <div className="text-slate-500 flex flex-col items-center">
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span>Subir Imagen</span>
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                )}

                {(activeTab === 'generate' || activeTab === 'video') && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Relación de Aspecto</label>
                            <select 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                            >
                                <option value={AspectRatio.SQUARE}>Cuadrado (1:1)</option>
                                <option value={AspectRatio.LANDSCAPE}>Paisaje (16:9)</option>
                                <option value={AspectRatio.PORTRAIT}>Retrato (9:16)</option>
                                {activeTab !== 'video' && <option value={AspectRatio.STANDARD}>Estándar (4:3)</option>}
                            </select>
                        </div>
                        {activeTab === 'generate' && (
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Resolución</label>
                                <select 
                                    value={resolution} 
                                    onChange={(e) => setResolution(e.target.value as ImageResolution)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
                                >
                                    <option value={ImageResolution.RES_1K}>1K</option>
                                    <option value={ImageResolution.RES_2K}>2K (Pro)</option>
                                    <option value={ImageResolution.RES_4K}>4K (Pro)</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                <button 
                    onClick={activeTab === 'generate' ? handleGenerate : activeTab === 'edit' ? handleEdit : handleVideo}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2"
                >
                    {loading && <RefreshCw className="animate-spin w-5 h-5" />}
                    {loading ? 'Creando...' : 'Crear'}
                </button>
            </div>

            {/* PREVIEW */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center min-h-[300px] overflow-hidden relative">
                {resultImage ? (
                    <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                ) : resultVideo ? (
                    <video controls src={resultVideo} className="w-full h-full object-contain" />
                ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800 mb-4" />
                        <p>Vista previa aquí</p>
                    </div>
                )}
                
                {(resultImage || resultVideo) && !loading && (
                    <a 
                        href={resultImage || resultVideo || '#'} 
                        download={`neuro-creation-${Date.now()}`}
                        className="absolute bottom-4 right-4 bg-slate-900/80 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                    </a>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeStudio;