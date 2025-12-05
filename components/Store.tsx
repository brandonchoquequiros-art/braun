
import React, { useState } from 'react';
import { ShoppingBag, ArrowRightLeft, Download, CheckCircle, X, QrCode, CreditCard, Star, BrainCircuit, Network, Clock, Sparkles, Box } from 'lucide-react';
import { StoreItem, StoreCategory } from '../types';

interface StoreProps {
  onOpenAR?: (modelUrl: string) => void;
}

const MOCK_ITEMS: StoreItem[] = [
  // --- GENERADOR ---
  {
    id: 'gen-1',
    title: 'Generador de Plantillas IA',
    category: 'IA_GENERATOR',
    description: '¿No encuentras lo que buscas? Describe tu tema y Gemini diseñará la estructura perfecta para ti al instante.',
    price: 5,
    previewUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80',
    features: ['Diseño a medida', 'Estructura inteligente', 'Exportable a PDF'],
    isGenerator: true
  },
  // --- MAPAS MENTALES ---
  {
    id: 'mm-1',
    title: 'Mapa Mental: Explosión Neuronal',
    category: 'MENTALES',
    description: 'Diseño radial orgánico ideal para lluvias de ideas y creatividad desbordante.',
    price: 0,
    previewUrl: 'https://images.unsplash.com/photo-1557318041-1ce374d55ebf?auto=format&fit=crop&w=400&q=80',
    features: ['Nodos ilimitados', 'Estilo orgánico', 'Colores vibrantes']
  },
  // --- 3D / MAPAS / AR ENABLED ITEMS ---
  {
    id: '102',
    title: 'Sistema Solar 3D (AR)',
    category: 'MAPAS',
    description: 'Plantilla visual interactiva. Proyecta los planetas en tu habitación.',
    price: 25,
    previewUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    features: ['Modelos 3D Reales', 'Modo AR', 'Datos orbitales'],
    arModelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' // Using Astronaut as placeholder for space theme
  },
  {
    id: '104',
    title: 'Anatomía: Esqueleto (AR)',
    category: 'MAPAS',
    description: 'Modelo anatómico completo para estudiantes de medicina.',
    price: 20,
    previewUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=400&q=80',
    features: ['Etiquetas latín', 'Vistas múltiples', 'Zoom articulaciones'],
    arModelUrl: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb' // Placeholder
  },
   // --- ORGANIGRAMAS ---
  {
    id: 'org-1',
    title: 'Organigrama Corporativo',
    category: 'ORGANIGRAMAS',
    description: 'La estructura estándar para empresas y grandes proyectos escolares.',
    price: 0,
    previewUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80',
    features: ['Jerarquía vertical', 'Fotos de perfil', 'Líneas claras']
  },
  // --- LÍNEAS DE TIEMPO ---
  {
    id: 'time-3',
    title: 'Evolución 3D Isométrica',
    category: 'TIEMPO',
    description: 'Una línea de tiempo con profundidad para mostrar progreso.',
    price: 25,
    previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    features: ['Estilo isométrico', 'Hitos 3D', 'Impacto visual alto']
  },
  // --- MAPAS CLÁSICOS ---
  {
    id: '101',
    title: 'Mapa Político de Bolivia (HD)',
    category: 'MAPAS',
    description: 'Mapa vectorial con los 9 departamentos, capitales y provincias.',
    price: 15,
    previewUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80',
    features: ['División política', 'Nombres provincias', 'Alta resolución']
  },
  {
    id: '2',
    title: 'Informe Estilo APA 7',
    category: 'INFORMES',
    description: 'Estructura lista para usar con márgenes y fuentes APA.',
    price: 0,
    previewUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
    features: ['Portada formal', 'Citas integradas', 'Bibliografía']
  }
];

const CATEGORIES: {id: StoreCategory | 'ALL', label: string, icon?: any}[] = [
    { id: 'ALL', label: 'Todo' },
    { id: 'IA_GENERATOR', label: 'Generar con IA', icon: Sparkles },
    { id: 'MAPAS', label: 'Mapas y AR', icon: Box },
    { id: 'MENTALES', label: 'Mentales', icon: BrainCircuit },
    { id: 'ORGANIGRAMAS', label: 'Organigramas', icon: Network },
    { id: 'TIEMPO', label: 'Tiempo', icon: Clock },
    { id: 'INFORMES', label: 'Informes' },
];

const Store: React.FC<StoreProps> = ({ onOpenAR }) => {
  const [filter, setFilter] = useState<StoreCategory | 'ALL'>('ALL');
  const [compareList, setCompareList] = useState<StoreItem[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [paymentItem, setPaymentItem] = useState<StoreItem | null>(null);

  const filteredItems = filter === 'ALL' ? MOCK_ITEMS : MOCK_ITEMS.filter(i => i.category === filter);

  const toggleCompare = (item: StoreItem) => {
    if (compareList.find(i => i.id === item.id)) {
      setCompareList(prev => prev.filter(i => i.id !== item.id));
    } else {
      if (compareList.length < 2) {
        setCompareList(prev => [...prev, item]);
      } else {
        alert("Solo puedes comparar 2 artículos a la vez.");
      }
    }
  };

  const handleAction = (item: StoreItem) => {
    if (item.isGenerator) {
        alert("Iniciando Gemini para generar tu plantilla personalizada...");
        return;
    }
    if (item.price > 0) {
      setPaymentItem(item);
    } else {
      // Check if it's an AR item
      if (item.arModelUrl && onOpenAR) {
          onOpenAR(item.arModelUrl);
      } else {
          alert(`Descargando ${item.title}...`);
      }
    }
  };

  const handlePaymentSuccess = () => {
       alert("¡Pago simulado exitoso!");
       if (paymentItem?.arModelUrl && onOpenAR) {
           onOpenAR(paymentItem.arModelUrl);
       } else {
           alert("Descarga iniciada.");
       }
       setPaymentItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-500" /> Tienda Estudiantil
          </h2>
          <p className="text-slate-400">Encuentra o genera la plantilla perfecta. ¡Ahora con modelos AR!</p>
        </div>
        
        {/* Compare Floating Button */}
        {compareList.length > 0 && (
          <div className="relative z-10 flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-xl border border-blue-500/30 shadow-lg animate-fade-in">
             <span className="text-sm font-bold text-white">{compareList.length} Seleccionados</span>
             {compareList.length === 2 && (
                <button 
                  onClick={() => setIsComparing(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Comparar
                </button>
             )}
             <button onClick={() => setCompareList([])} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
                <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`px-5 py-2.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    filter === cat.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    {Icon && <Icon className="w-4 h-4" />}
                    {cat.label}
                </button>
            );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
           const isSelected = !!compareList.find(i => i.id === item.id);
           return (
            <div key={item.id} className={`bg-slate-800 rounded-2xl overflow-hidden border transition-all duration-300 hover:translate-y-[-4px] group flex flex-col ${isSelected ? 'border-blue-500 shadow-blue-900/20 shadow-lg ring-2 ring-blue-500/20' : 'border-slate-700 hover:border-slate-500'} ${item.isGenerator ? 'bg-gradient-to-br from-indigo-900/40 to-slate-800 border-indigo-500/50' : ''}`}>
                <div className="h-52 overflow-hidden relative">
                    <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                    
                    {item.isGenerator ? (
                        <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> IA GEN
                        </div>
                    ) : (
                         <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full text-blue-400 border border-slate-700">
                            {item.category}
                        </div>
                    )}
                    
                    {item.arModelUrl && (
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full text-green-400 border border-slate-700 flex items-center gap-1">
                             <Box className="w-3 h-3" /> 3D / AR
                        </div>
                    )}

                    <div className="absolute bottom-3 right-3">
                         {item.price === 0 ? (
                             <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Gratis</span>
                         ) : (
                             <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">Bs. {item.price}</span>
                         )}
                    </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {item.features.slice(0, 2).map((f, i) => (
                             <span key={i} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded border border-slate-700">{f}</span>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-auto">
                        <button 
                            onClick={() => handleAction(item)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all ${
                                item.isGenerator
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                : item.price === 0 
                                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20'
                            }`}
                        >
                            {item.isGenerator ? <Sparkles className="w-4 h-4" /> : (item.price === 0 ? (item.arModelUrl ? <Box className="w-4 h-4" /> : <Download className="w-4 h-4" />) : <CreditCard className="w-4 h-4" />)}
                            {item.isGenerator ? 'Generar' : (item.price === 0 ? (item.arModelUrl ? 'Ver en AR' : 'Descargar') : 'Comprar')}
                        </button>
                        {!item.isGenerator && (
                            <button 
                                onClick={() => toggleCompare(item)}
                                className={`px-3 py-2 rounded-xl border transition-colors ${isSelected ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                title="Comparar"
                            >
                                <ArrowRightLeft className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
           );
        })}
      </div>

      {/* Payment QR Modal */}
      {paymentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 overflow-hidden shadow-2xl transform transition-all scale-100">
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700 text-center relative">
                    <button 
                        onClick={() => setPaymentItem(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Pago por QR Simple</h3>
                    <p className="text-slate-400 text-sm">Escanea para adquirir esta plantilla</p>
                </div>
                
                <div className="p-8 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-xl mb-6 shadow-xl">
                         {/* Placeholder QR */}
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PagoBolivianos_${paymentItem.id}_${paymentItem.price}`} alt="QR de Pago" className="w-48 h-48" />
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 text-sm">Artículo:</span>
                            <span className="text-white font-medium text-right truncate max-w-[150px]">{paymentItem.title}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-700 pt-2">
                            <span className="text-slate-400 text-sm">Total a Pagar:</span>
                            <span className="text-2xl font-bold text-green-400">Bs. {paymentItem.price}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePaymentSuccess}
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20"
                    >
                        He realizado el pago
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isComparing && compareList.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <ArrowRightLeft className="w-6 h-6 text-blue-500" /> Comparar Plantillas
                  </h3>
                  <button onClick={() => setIsComparing(false)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700"><X /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 divide-x divide-slate-800 min-h-full">
                      {compareList.map((item, idx) => (
                          <div key={item.id} className="p-6 md:p-8 space-y-6 flex flex-col">
                              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-700 group">
                                  <img src={item.previewUrl} alt="" className="w-full h-56 object-cover" />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                              </div>
                              
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="text-2xl font-bold text-white">{item.title}</h4>
                                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.price === 0 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                          {item.price === 0 ? 'Gratis' : `Bs. ${item.price}`}
                                      </span>
                                  </div>
                                  <p className="text-slate-400 mb-6 text-lg">{item.description}</p>
                                  
                                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                      <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                                          <Star className="w-4 h-4 text-yellow-500" /> Lo mejor de esto:
                                      </h5>
                                      <ul className="space-y-3">
                                          {item.features.map(f => (
                                              <li key={f} className="flex items-start gap-3 text-slate-300">
                                                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                  <span>{f}</span>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              </div>
                              
                              <button 
                                onClick={() => {
                                    handleAction(item);
                                    setIsComparing(false);
                                }}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                    item.price === 0 
                                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                                }`}
                              >
                                  {item.price === 0 ? 'Elegir Gratis' : 'Comprar Ahora'}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Store;