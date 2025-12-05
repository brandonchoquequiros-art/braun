import React, { useState } from 'react';
import { Search, MapPin, Globe, ArrowRight } from 'lucide-react';
import { groundSearch, groundMaps } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const SmartSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'search' | 'maps'>('search');
    const [result, setResult] = useState<{text: string, chunks: any[]} | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setResult(null);
        
        try {
            if (mode === 'search') {
                const res = await groundSearch(query);
                setResult(res);
            } else {
                // Get geolocation first
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                         const res = await groundMaps(query, position.coords.latitude, position.coords.longitude);
                         setResult(res);
                    }, () => {
                        alert("Se requiere acceso a ubicación para Mapas");
                        setLoading(false);
                    });
                } else {
                    alert("Geolocalización no soportada");
                    setLoading(false);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Búsqueda fallida");
        } finally {
            if (mode === 'search') setLoading(false); 
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Recursos Inteligentes</h2>
                
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setMode('search')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${mode === 'search' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                        <Globe className="w-4 h-4" /> Búsqueda con Google
                    </button>
                    <button 
                         onClick={() => setMode('maps')}
                         className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${mode === 'maps' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                        <MapPin className="w-4 h-4" /> Mapas
                    </button>
                </div>

                <div className="flex gap-2 mb-8">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={mode === 'search' ? "Buscar artículos recientes..." : "Buscar bibliotecas cercanas..."}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 rounded-xl transition-colors"
                    >
                        {loading ? '...' : <Search className="w-5 h-5" />}
                    </button>
                </div>

                {result && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-slate-900/50 p-6 rounded-xl text-slate-300 prose prose-invert max-w-none">
                            <ReactMarkdown>{result.text}</ReactMarkdown>
                        </div>

                        {/* Grounding Sources */}
                        {result.chunks.length > 0 && (
                            <div className="border-t border-slate-700 pt-4">
                                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Fuentes</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {result.chunks.map((chunk, i) => {
                                        const uri = chunk.web?.uri || chunk.maps?.uri;
                                        const title = chunk.web?.title || chunk.maps?.title || "Enlace a Fuente";
                                        
                                        if (!uri) return null;
                                        
                                        return (
                                            <a 
                                                key={i} 
                                                href={uri} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="block p-3 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all text-sm text-blue-400 truncate"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{title}</span>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartSearch;
