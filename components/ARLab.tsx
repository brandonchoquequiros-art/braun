import React, { useState, useRef, useEffect } from 'react';
import { Box, Layers, MousePointer2, Mic, RotateCcw, Smartphone, Maximize, Plus, Tag, X, Loader2 } from 'lucide-react';

interface ARLabProps {
  initialModelUrl?: string;
}

interface Annotation {
  id: string;
  position: string; // "x y z"
  normal: string;   // "x y z"
  label: string;
}

// Mock knowledge base for the default Astronaut model
const ASTRONAUT_ANNOTATIONS: Annotation[] = [
    { id: '1', position: '-0.15 1.7 0.35', normal: '0 0 1', label: 'Visor Solar (Oro)' },
    { id: '2', position: '0.2 1.2 0.4', normal: '0 0 1', label: 'Unidad de Control' },
    { id: '3', position: '-0.4 0.9 0', normal: '-1 0 0', label: 'Guante Presurizado' },
    { id: '4', position: '0 1.5 -0.3', normal: '0 0 -1', label: 'Sistema Soporte Vital' },
];

const ARLab: React.FC<ARLabProps> = ({ initialModelUrl }) => {
  // Default to a generic educational model if none passed (Neil Armstrong's Spacesuit is a stable GLB example)
  const [modelUrl, setModelUrl] = useState(initialModelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb');
  const [isBlueprintMode, setIsBlueprintMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const viewerRef = useRef<any>(null);

  // Reset annotations when model changes
  useEffect(() => {
      setAnnotations([]);
  }, [modelUrl]);

  const toggleBlueprint = () => {
    setIsBlueprintMode(!isBlueprintMode);
  };

  const handleModelClick = (event: any) => {
    if (!viewerRef.current) return;
    
    // In a real implementation with Raycasting, we would calculate position here.
    // For now, we just log it.
    console.log("Clicked model");
  };

  const handleAIEdit = () => {
    if (!editPrompt) return;
    setIsProcessing(true);
    
    const promptLower = editPrompt.toLowerCase();

    // Simulate Gemini "Thinking" and processing the 3D mesh
    setTimeout(() => {
        setIsProcessing(false);
        setEditPrompt('');

        // Logic to interpret user intent
        if (promptLower.includes('etiqueta') || promptLower.includes('nombre') || promptLower.includes('partes') || promptLower.includes('label')) {
            // Check if it's the astronaut model (basic check for demo)
            if (modelUrl.includes('Astronaut')) {
                setAnnotations(ASTRONAUT_ANNOTATIONS);
                alert("Gemini: He analizado la estructura. Aquí tienes las etiquetas de los componentes principales.");
            } else {
                // Fallback for other models
                setAnnotations([
                    { id: 'temp1', position: '0 1 0', normal: '0 1 0', label: 'Componente Central' }
                ]);
                alert("Gemini: He identificado el eje central del objeto.");
            }
        } else if (promptLower.includes('borra') || promptLower.includes('limpia') || promptLower.includes('quita')) {
            setAnnotations([]);
             alert("Gemini: He limpiado todas las anotaciones.");
        } else {
            alert(`Gemini: He procesado tu solicitud "${editPrompt}". En esta demo, intenta pedirme "Añade etiquetas a los componentes".`);
        }
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-900 relative animate-fade-in overflow-hidden rounded-2xl border border-slate-700">
      
      {/* 3D VIEWER CONTAINER */}
      <div className={`flex-1 relative transition-all duration-500 ${isBlueprintMode ? 'bg-[#001e4d]' : 'bg-slate-800'}`}>
        {isBlueprintMode && (
             <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
                  style={{
                      backgroundImage: 'linear-gradient(#4d8bff 1px, transparent 1px), linear-gradient(90deg, #4d8bff 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                  }} 
             />
        )}

        {/* @ts-ignore */}
        <model-viewer
          ref={viewerRef}
          src={modelUrl}
          ios-src="" 
          alt="Modelo Educativo 3D"
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity={1}
          style={{
              width: '100%', 
              height: '100%',
              // Blueprint Filter Effect
              filter: isBlueprintMode ? 'sepia(1) hue-rotate(190deg) saturate(200%) contrast(1.2) brightness(0.8)' : 'none'
          }}
          onClick={handleModelClick}
        >
            {/* RENDER ANNOTATIONS (HOTSPOTS) */}
            {annotations.map((ann) => (
                <button 
                    key={ann.id}
                    slot={`hotspot-${ann.id}`} 
                    data-position={ann.position} 
                    data-normal={ann.normal}
                    className="group"
                >
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-xl transition-all duration-300 transform group-hover:scale-110 ${isBlueprintMode ? 'bg-blue-900/80 border-blue-400 text-blue-100' : 'bg-white/90 border-slate-200 text-slate-800'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isBlueprintMode ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
                        <span className="text-xs font-bold whitespace-nowrap">{ann.label}</span>
                    </div>
                    {/* Line connector simulation */}
                    <div className={`w-0.5 h-4 mx-auto ${isBlueprintMode ? 'bg-blue-400' : 'bg-white'}`}></div>
                </button>
            ))}

            <button slot="ar-button" className="absolute bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 z-50 transition-transform hover:scale-105">
                <Smartphone className="w-5 h-5" />
                Ver en mi espacio (AR)
            </button>
        {/* @ts-ignore */}
        </model-viewer>

        {/* Overlay Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-3 z-10">
            <button 
                onClick={toggleBlueprint}
                className={`p-3 rounded-xl border backdrop-blur-md transition-all ${isBlueprintMode ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800'}`}
                title="Modo Plano (Blueprint)"
            >
                <Layers className="w-6 h-6" />
            </button>
            
            {annotations.length > 0 && (
                <button 
                    className="p-3 rounded-xl bg-slate-900/60 text-red-400 border border-slate-700 backdrop-blur-md hover:bg-slate-800"
                    title="Borrar Etiquetas"
                    onClick={() => setAnnotations([])}
                >
                    <X className="w-6 h-6" />
                </button>
            )}
             <button 
                className="p-3 rounded-xl bg-slate-900/60 text-slate-300 border border-slate-700 backdrop-blur-md hover:bg-slate-800"
                title="Resetear Vista"
                onClick={() => {
                     // Hacky reset via DOM
                     const el = document.querySelector('model-viewer') as any;
                     if(el) el.dismissPoster();
                }}
            >
                <RotateCcw className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* EDITOR SIDEBAR */}
      <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col z-20 shadow-2xl">
        <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Box className="w-6 h-6 text-blue-500" /> Laboratorio AR
            </h2>
            <p className="text-sm text-slate-400">Edita y visualiza estructuras en el mundo real.</p>
        </div>

        {/* AI Command Center */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Editor IA Gemini</label>
            <textarea 
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Ej: 'Identifica las partes principales', 'Etiqueta los componentes', 'Cambia a modo rayos X'..."
                className="w-full h-24 bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white resize-none focus:border-blue-500 focus:outline-none mb-3"
            />
            <button 
                onClick={handleAIEdit}
                disabled={!editPrompt || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
                {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isProcessing ? 'Analizando Modelo...' : 'Ejecutar Cambios'}
            </button>
        </div>

        {/* Object Info */}
        <div className="flex-1">
             <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase">Propiedades del Objeto</h3>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-slate-400">Anotaciones</span>
                    <span className="text-white font-mono">{annotations.length} activas</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-slate-400">Material</span>
                    <span className="text-white font-mono">{isBlueprintMode ? 'Blueprint (Digital)' : 'Standard PBR'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-slate-400">Modo Visualización</span>
                    <span className="text-white font-mono">{isBlueprintMode ? 'Técnico' : 'Realista'}</span>
                </div>
             </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
             <div className="flex items-start gap-3">
                 <Smartphone className="w-8 h-8 text-blue-400" />
                 <div>
                     <p className="text-blue-200 text-sm font-bold">Modo AR Listo</p>
                     <p className="text-blue-300/70 text-xs mt-1">Las etiquetas también serán visibles cuando proyectes el modelo en tu habitación.</p>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ARLab;