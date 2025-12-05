import React, { useState, useEffect } from 'react';
import { ViewState, QuizQuestion, ScanResult } from './types';
import Scanner from './components/Scanner';
import Quiz from './components/Quiz';
import StudyBuddy from './components/StudyBuddy';
import CreativeStudio from './components/CreativeStudio';
import SmartSearch from './components/SmartSearch';
import Store from './components/Store';
import ARLab from './components/ARLab';
import { BookOpen, Camera, MessageCircle, Palette, Zap, LayoutDashboard, Globe, Bell, Flame, Menu, X, ShoppingBag, ChevronRight, Calendar, Box } from 'lucide-react';

// --- COMPONENTS ---

interface ActionCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  image: string;
  colorClass: string; // Pre-defined tailwind class string for bg/border
}

const ActionCard: React.FC<ActionCardProps> = ({ onClick, icon, title, desc, image, colorClass }) => (
  <button 
    onClick={onClick}
    className="group relative overflow-hidden rounded-2xl border border-slate-700 aspect-[4/3] text-left transition-all hover:scale-[1.02] hover:shadow-xl w-full"
  >
    <div className="absolute inset-0">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90"></div>
    </div>
    
    <div className="absolute bottom-0 left-0 p-6 w-full">
      <div className={`w-12 h-12 rounded-xl backdrop-blur-md flex items-center justify-center mb-4 border transition-colors ${colorClass}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">{title}</h3>
      <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{desc}</p>
    </div>
  </button>
);

interface VisualNavButtonProps {
    id: ViewState;
    current: ViewState;
    label: string;
    icon: React.ReactNode;
    img: string;
    onClick: (v: ViewState) => void;
}

const VisualNavButton: React.FC<VisualNavButtonProps> = ({ id, current, label, icon, img, onClick }) => {
    const isActive = current === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`group relative w-full h-20 rounded-xl overflow-hidden border transition-all duration-300 ${isActive ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'}`}
        >
            <div className="absolute inset-0">
                <img src={img} alt={label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className={`absolute inset-0 transition-colors ${isActive ? 'bg-blue-900/60' : 'bg-slate-900/80 group-hover:bg-slate-900/60'}`} />
            </div>
            <div className="absolute inset-0 flex items-center px-4 gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800/50 text-slate-300 group-hover:text-white'}`}>
                    {icon}
                </div>
                <span className={`font-bold text-lg tracking-wide ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {label}
                </span>
            </div>
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
        </button>
    );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[] | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // AR State
  const [arModel, setArModel] = useState<string | undefined>(undefined);

  // Persistence state
  const [savedQuizzes, setSavedQuizzes] = useState<ScanResult[]>([]);
  const [streak, setStreak] = useState(0);

  // Load from LocalStorage on mount
  useEffect(() => {
    const loaded = localStorage.getItem('neuroNotionQuizzes');
    if (loaded) {
      try {
        setSavedQuizzes(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to load quizzes", e);
      }
    }
    
    // Simple streak logic
    const lastVisit = localStorage.getItem('neuroNotionLastVisit');
    const currentStreak = parseInt(localStorage.getItem('neuroNotionStreak') || '0');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
        if (lastVisit) {
            setStreak(currentStreak + 1);
            localStorage.setItem('neuroNotionStreak', (currentStreak + 1).toString());
        } else {
            setStreak(1);
            localStorage.setItem('neuroNotionStreak', '1');
        }
        localStorage.setItem('neuroNotionLastVisit', today);
    } else {
        setStreak(currentStreak);
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (savedQuizzes.length > 0) {
        localStorage.setItem('neuroNotionQuizzes', JSON.stringify(savedQuizzes));
    }
  }, [savedQuizzes]);

  const handleScanComplete = (result: ScanResult) => {
    setSavedQuizzes(prev => [result, ...prev]);
    setActiveQuiz(result.quiz);
    setView(ViewState.DASHBOARD); 
  };

  const startReview = () => {
    const allQuestions = savedQuizzes.flatMap(q => q.quiz);
    if (allQuestions.length === 0) return;
    // Simple shuffle
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setActiveQuiz(shuffled.slice(0, 5));
  };

  const handleOpenAR = (modelUrl: string) => {
    setArModel(modelUrl);
    setView(ViewState.AR_LAB);
  };

  const renderContent = () => {
    if (activeQuiz) {
      return <Quiz questions={activeQuiz} onExit={() => setActiveQuiz(null)} />;
    }

    switch (view) {
      case ViewState.SCANNER:
        return <Scanner onScanComplete={handleScanComplete} />;
      case ViewState.STUDY_BUDDY:
        return <StudyBuddy />;
      case ViewState.CREATIVE_LAB:
        return <CreativeStudio />;
      case ViewState.RESOURCES:
        return <SmartSearch />;
      case ViewState.STORE:
        return <Store onOpenAR={handleOpenAR} />;
      case ViewState.AR_LAB:
        return <ARLab initialModelUrl={arModel} />;
      case ViewState.DASHBOARD:
      default:
        const totalQuestions = savedQuizzes.reduce((acc, curr) => acc + curr.quiz.length, 0);
        const reviewCount = Math.min(totalQuestions, Math.floor(Math.random() * 5) + 3); 

        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
                {/* HERO */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 md:p-12 mb-8">
                  <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                     <img 
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" 
                        alt="Hero bg" 
                        className="w-full h-full object-cover"
                     />
                     <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
                        Neuro<span className="text-blue-500">Notion</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">
                        Tu segundo cerebro digital. Potenciado por Gemini para transformar tu forma de aprender.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-2">
                             <Flame className="w-5 h-5 text-orange-500" />
                             <span className="font-bold text-white">{streak} Días de Racha</span>
                        </div>
                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-2">
                             <BookOpen className="w-5 h-5 text-blue-500" />
                             <span className="font-bold text-white">{savedQuizzes.length} Apuntes</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* NOTIFICATIONS */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                        
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-600/20 relative group-hover:scale-110 transition-transform">
                                <Bell className="w-8 h-8 text-white" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-4 border-indigo-600 animate-pulse"></span>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-1">Tu Repaso Diario</h4>
                                <p className="text-indigo-200">
                                    {savedQuizzes.length > 0 
                                     ? `La repetición espaciada es clave. Tienes ${reviewCount} preguntas pendientes.` 
                                     : "Aún no tienes material. Escanea tus apuntes para empezar."}
                                </p>
                            </div>
                        </div>
                        {savedQuizzes.length > 0 && (
                            <button 
                                onClick={startReview}
                                className="w-full md:w-auto bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-xl relative z-10 whitespace-nowrap"
                            >
                                Iniciar Sesión
                            </button>
                        )}
                    </div>
                </div>

                {/* FEATURE GRID */}
                <h3 className="text-2xl font-bold text-white mt-10 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" /> Herramientas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ActionCard 
                        onClick={() => setView(ViewState.SCANNER)}
                        icon={<Camera className="w-6 h-6 text-white" />}
                        title="Escanear"
                        desc="Digitaliza tu cuaderno"
                        image="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=400&q=80"
                        colorClass="bg-blue-500/20 border-blue-500/30 group-hover:bg-blue-500"
                    />
                    <ActionCard 
                        onClick={() => setView(ViewState.STUDY_BUDDY)}
                        icon={<MessageCircle className="w-6 h-6 text-white" />}
                        title="Tutor IA"
                        desc="Ayuda 24/7"
                        image="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=400&q=80"
                        colorClass="bg-pink-500/20 border-pink-500/30 group-hover:bg-pink-500"
                    />
                     <ActionCard 
                        onClick={() => setView(ViewState.AR_LAB)}
                        icon={<Box className="w-6 h-6 text-white" />}
                        title="Lab AR"
                        desc="Modelos 3D y Planos"
                        image="https://images.unsplash.com/photo-1633419461186-7d40a2307e68?auto=format&fit=crop&w=400&q=80"
                        colorClass="bg-indigo-500/20 border-indigo-500/30 group-hover:bg-indigo-500"
                    />
                    <ActionCard 
                        onClick={() => setView(ViewState.CREATIVE_LAB)}
                        icon={<Palette className="w-6 h-6 text-white" />}
                        title="Estudio"
                        desc="Crea Imágenes y Video"
                        image="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80"
                        colorClass="bg-purple-500/20 border-purple-500/30 group-hover:bg-purple-500"
                    />
                     <ActionCard 
                        onClick={() => setView(ViewState.RESOURCES)}
                        icon={<Globe className="w-6 h-6 text-white" />}
                        title="Investigar"
                        desc="Datos verificados"
                        image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80"
                        colorClass="bg-green-500/20 border-green-500/30 group-hover:bg-green-500"
                    />
                     <ActionCard 
                        onClick={() => setView(ViewState.STORE)}
                        icon={<ShoppingBag className="w-6 h-6 text-white" />}
                        title="Tienda"
                        desc="Plantillas y Mapas"
                        image="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=400&q=80"
                        colorClass="bg-orange-500/20 border-orange-500/30 group-hover:bg-orange-500"
                    />
                </div>

                {/* RECENT LIBRARY */}
                {savedQuizzes.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-slate-400" /> Recientes
                            </h3>
                            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Ver todo</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedQuizzes.slice(0, 4).map((sq) => (
                                <div key={sq.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all flex justify-between items-center group cursor-pointer" onClick={() => setActiveQuiz(sq.quiz)}>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-slate-700 p-3 rounded-xl text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg">{sq.title}</p>
                                            <p className="text-sm text-slate-400 mt-1 line-clamp-1">{sq.summary}</p>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                                                <span className="bg-slate-700/50 px-2 py-1 rounded text-slate-300">{new Date(sq.date).toLocaleDateString()}</span>
                                                <span className="bg-slate-700/50 px-2 py-1 rounded text-slate-300">{sq.quiz.length} Preguntas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
  };

  const navItems = [
    { 
        id: ViewState.DASHBOARD, 
        label: "Inicio", 
        icon: <LayoutDashboard className="w-5 h-5" />,
        img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=300&q=80"
    },
    { 
        id: ViewState.SCANNER, 
        label: "Escáner", 
        icon: <Camera className="w-5 h-5" />,
        img: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=300&q=80"
    },
    { 
        id: ViewState.AR_LAB, 
        label: "Lab AR", 
        icon: <Box className="w-5 h-5" />,
        img: "https://images.unsplash.com/photo-1633419461186-7d40a2307e68?auto=format&fit=crop&w=300&q=80"
    },
    { 
        id: ViewState.STUDY_BUDDY, 
        label: "Tutor IA", 
        icon: <MessageCircle className="w-5 h-5" />,
        img: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=300&q=80"
    },
    { 
        id: ViewState.CREATIVE_LAB, 
        label: "Estudio", 
        icon: <Palette className="w-5 h-5" />,
        img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80"
    },
    { 
        id: ViewState.RESOURCES, 
        label: "Recursos", 
        icon: <Globe className="w-5 h-5" />,
        img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80"
    },
    { 
        id: ViewState.STORE, 
        label: "Tienda", 
        icon: <ShoppingBag className="w-5 h-5" />,
        img: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=300&q=80"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-['Inter']">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">N</div>
            <span className="font-bold text-lg text-white">NeuroNotion</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
             {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* SIDEBAR NAVIGATION (Desktop + Mobile) */}
      <nav className={`
        fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 md:relative md:translate-x-0 md:w-80 md:border-r md:border-slate-800 md:bg-slate-900 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:block">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <span className="font-bold text-white text-xl">N</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Neuro<span className="text-blue-500">Notion</span></h1>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest pl-1">Student AI OS</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {navItems.map(item => (
                <VisualNavButton 
                    key={item.id}
                    {...item}
                    current={view}
                    onClick={(v) => {
                        setView(v);
                        setActiveQuiz(null);
                        setIsMobileMenuOpen(false);
                    }}
                />
            ))}
        </div>

        <div className="p-4 border-t border-slate-800">
             <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3 border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold">
                    {streak}
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Racha Actual</p>
                    <p className="text-white font-medium text-sm">¡Sigue así!</p>
                </div>
             </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8 bg-slate-950">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;