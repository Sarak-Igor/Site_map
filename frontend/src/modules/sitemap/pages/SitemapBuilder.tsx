import React, { useState } from 'react';
import { AlignLeft, Download, Layers, Play, Zap, HelpCircle, LayoutGrid, ListTree, Loader2, ChevronDown, ChevronRight, Plus, Minus, Share2, Palette, Eye, EyeOff, Monitor, PenTool, Cpu, Boxes, Type, TrendingUp, Box, Grid, Sparkles, Layout, Route, Map } from 'lucide-react';
import axios from 'axios';
import SitemapRenderer from '../components/SitemapRenderer';
import { parseIndentedText } from '../utils/parseIndent';
import CustomHelpModal from '../components/CustomHelpModal';

// Axios Instance para Bater na API que criamos no Backend (Porta 1300)
const api = axios.create({
    baseURL: 'http://localhost:1300'
});

const SitemapBuilder = () => {
    // View Viewport States
    const [rawText, setRawText] = useState("Holding Global S.A.\n  Divisão de Tecnologia\n    Engenharia de Software\n      Sistemas Web\n      Mobile Apps\n    Arquitetura Cloud\n      Infraestrutura\n      Segurança Cibernética\n  Divisão Comercial\n    Marketing Digital\n      Growth Hacking\n      Social Media\n    Vendas B2B\n      Key Accounts\n      Parcerias Estratégicas");
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    
    // Core Logic States
    const [templateId, setTemplateId] = useState('mindmap'); // mindmap, sitemap, orgchart
    const [layoutDirection, setLayoutDirection] = useState('vertical'); // vertical, horizontal
    const [nodeColor, setNodeColor] = useState('#3b82f6'); // Cor padrão (Azul)
    const [colorMode, setColorMode] = useState<'mono' | 'multi'>('mono');
    const [edgeColorMode, setEdgeColorMode] = useState<'colored' | 'bw'>('colored');

    // Interaction States
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isMindMapSectionOpen, setIsMindMapSectionOpen] = useState(true);
    const [isRoadmapSectionOpen, setIsRoadmapSectionOpen] = useState(false);
    const [isInputExpanded, setIsInputExpanded] = useState(false);

    const templates = [
        { id: 'mindmap', label: 'Mapa Mental', desc: 'Múltiplas ramificações, cores por níveis, curvas orgânicas.', icon: <LayoutGrid className="w-4 h-4" /> },
        { id: 'sitemap', label: 'Site Map', desc: 'Fluxo descendente, linhas angulares e blocos padronizados.', icon: <ListTree className="w-4 h-4" /> },
        { id: 'orgchart', label: 'Organograma', desc: 'Ideal para cargos e nomes com divisão em duas linhas.', icon: <AlignLeft className="w-4 h-4" /> },
        { id: 'grap', label: 'GRAP Framework', desc: 'Timeline central com círculos e descrições laterais.', icon: <Play className="w-4 h-4" /> },
        { id: 'backlinko', label: 'SEO Dashboard', desc: 'Estilo Backlinko: Cabeçalho azul e corpo roxo vibrante.', icon: <Zap className="w-4 h-4" /> },
        { id: 'wireframe', label: 'Wireflow Artigos', desc: 'Simulação de janelas de site com Header, Content e Footer.', icon: <Layers className="w-4 h-4" /> },
        { id: 'neobrutalist', label: 'Neo-Brutalismo', desc: 'Bordas grossas, sombras rígidas e estética pop-vibrante.', icon: <Zap className="w-4 h-4 text-theme-primary" /> },
        { id: 'glass', label: 'Glassmorphism', desc: 'Efeito de vidro fosco, transparências e visual ultra-premium.', icon: <div className="w-4 h-4 bg-gradient-to-br from-white/40 to-white/10 rounded-full blur-[1px] border border-white/20" /> },
        { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'Hackeado: Glow neon, grid e estética glitch futurista.', icon: <Cpu className="w-4 h-4 text-pink-500" /> },
        { id: 'sketch', label: 'Sketch / Desenho', desc: 'Visual orgânico feito à mão com toque artístico.', icon: <PenTool className="w-4 h-4 text-amber-600" /> },
        { id: 'hologram', label: 'Holograma', desc: 'Visual ciano translúcido com scanlines e profundidade.', icon: <Monitor className="w-4 h-4 text-cyan-400" /> },
        { id: 'swiss', label: 'Swiss / Minimal', desc: 'Tipografia radical, grid rigoroso e visual Bauhaus.', icon: <Type className="w-4 h-4" /> },
        { id: 'retro', label: '8-Bit Retro', desc: 'Pixel art style, terminal antigo e estética de arcade.', icon: <Boxes className="w-4 h-4 text-green-500" /> }
    ];

    const roadmapTemplates = [
        { id: 'timeline', label: 'Timeline Clássica', desc: 'Linha do tempo vertical com ícones de marcos.', icon: <LayoutGrid className="w-4 h-4 text-theme-primary" /> },
        { id: 'milestone', label: 'Lista de Marcos', desc: 'Organizado por fases e entregas principais.', icon: <Layers className="w-4 h-4 text-emerald-500" /> },
        { id: 'gantt', label: 'Simple Gantt', desc: 'Visualização de barras paralelas e progresso.', icon: <AlignLeft className="w-4 h-4 text-amber-500" /> },
        { id: 'wave', label: 'Curva de Marketing', desc: 'Estilo S-Curve com arcos e metas alternadas.', icon: <TrendingUp className="w-4 h-4 text-pink-500" /> },
        { id: 'isometric', label: '3D Isometric', desc: 'Blocos tridimensionais com profundidade e sombra.', icon: <Boxes className="w-4 h-4 text-theme-primary" /> },
        { id: 'minimal', label: 'Minimal Executive', desc: 'Design ultra-clean focado em tipografia e espaços.', icon: <Layout className="w-4 h-4 text-slate-400" /> },
        { id: 'blueprint', label: 'Blueprint Tech', desc: 'Estilo desenho técnico sobre grid de engenharia.', icon: <Grid className="w-4 h-4 text-blue-400" /> },
        { id: 'glass', label: 'Glassmorphism', desc: 'Cards de vidro translúcido com efeito blur premium.', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
        { id: 'winding', label: 'Winding Road', desc: 'Trajeto curvado com asfalto e sinalização orgânica.', icon: <Route className="w-4 h-4 text-amber-600" /> },
        { id: 'zigzag', label: 'Zig-Zag Trail', desc: 'Caminho geométrico em Z para jornadas dinâmicas.', icon: <Map className="w-4 h-4 text-emerald-600" /> }
    ];

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError("");

        try {
            // 1. O Textarea cru vai virar uma Array estruturada através do algoritmo local
            const items = parseIndentedText(rawText);

            // 2. Chama a API poderosa que você construiu no Backend (FastAPI)
            const response = await api.post('/sitemap/generate', { items });

            // 3. Joga os Grafos e Edges mastigados pela API no Canvas do React Flow
            setGraphData({
                nodes: response.data.nodes,
                edges: response.data.edges
            });
            
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Ocorreu um erro ao gerar o mapa.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Cabeçalho */}
            <div>
                <h1 className="text-3xl font-black text-theme-title tracking-tight text-theme-primary">Gerador de Mapas</h1>
                <p className="text-theme-muted mt-2">
                    Cole sua lista hierárquica e visualize a estrutura com diferentes layouts e estilos focados em UX.
                </p>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Painel Esquerdo: Controles & Input */}
                <div className="w-[380px] h-full flex flex-col gap-6 bg-theme-card/50 p-6 rounded-2xl border border-theme-border flex-shrink-0 backdrop-blur-sm shadow-xl overflow-y-auto custom-scrollbar">
                    
                    {/* Seção Colapsável: Mind Map */}
                    <div className="flex flex-col gap-6 transition-all">
                        <button 
                            onClick={() => {
                                setIsMindMapSectionOpen(!isMindMapSectionOpen);
                                if (!isMindMapSectionOpen) {
                                    setIsRoadmapSectionOpen(false);
                                    // Se o texto for o de Roadmap, volta para o de Mind Map ao reabrir
                                    const roadmapStarts = ["Projeto Estratégico", "Soft. de Mensagens", "Planejamento Estratégico", "Roadmap de Software"];
                                    if (roadmapStarts.some(s => rawText.startsWith(s))) {
                                        setRawText("Holding Global S.A.\n  Divisão de Tecnologia\n    Engenharia de Software\n      Sistemas Web\n      Mobile Apps\n    Arquitetura Cloud\n      Infraestrutura\n      Segurança Cibernética\n  Divisão Comercial\n    Marketing Digital\n      Growth Hacking\n      Social Media\n    Vendas B2B\n      Key Accounts\n      Parcerias Estratégicas");
                                        setTemplateId('mindmap');
                                    }
                                }
                            }}
                            className="flex items-center justify-between w-full py-2 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-theme-primary/10 rounded-lg text-theme-primary">
                                    <ListTree className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-black text-theme-title tracking-tight uppercase tracking-widest">Mind Map</span>
                            </div>
                            <div className="text-theme-muted group-hover:text-theme-primary transition-colors">
                                {isMindMapSectionOpen ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                            </div>
                        </button>

                        {isMindMapSectionOpen && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Orientação */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Orientação do Mapa
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        <button 
                                            onClick={() => setLayoutDirection('vertical')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${layoutDirection === 'vertical' ? 'bg-theme-primary text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <LayoutGrid className="w-4 h-4" /> Vertical
                                        </button>
                                        <button 
                                            onClick={() => setLayoutDirection('horizontal')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${layoutDirection === 'horizontal' ? 'bg-theme-primary text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <ListTree className="w-4 h-4" /> Horizontal
                                        </button>
                                    </div>
                                </div>

                                {/* Modo de Cor */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Modo de Cor
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        <button 
                                            onClick={() => setColorMode('mono')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${colorMode === 'mono' ? 'bg-theme-primary text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColor }} /> Mono
                                        </button>
                                        <button 
                                            onClick={() => setColorMode('multi')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${colorMode === 'multi' ? 'bg-theme-primary text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <div className="flex -space-x-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-theme-body" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-theme-body" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-theme-body" />
                                            </div>
                                            Multi
                                        </button>
                                    </div>
                                </div>

                                {/* Cor das Linhas */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 block flex items-center gap-2">
                                        <Share2 className="w-3 h-3" /> Cor das Linhas
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        <button
                                            onClick={() => setEdgeColorMode('colored')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                                edgeColorMode === 'colored' 
                                                ? 'bg-theme-primary text-white shadow-md' 
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                            }`}
                                        >
                                            <Palette className="w-3 h-3" /> Colorido
                                        </button>
                                        <button
                                            onClick={() => setEdgeColorMode('bw')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                                edgeColorMode === 'bw' 
                                                ? 'bg-theme-primary text-white shadow-md' 
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                            }`}
                                        >
                                            <div className="w-3 h-3 border-2 border-theme-muted rounded-full" /> P&B
                                        </button>
                                    </div>
                                </div>

                                {/* Seleção de Template Visual */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Template Visual
                                    </label>
                                    <div className="grid gap-3">
                                        {templates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTemplateId(t.id)}
                                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                                                    templateId === t.id 
                                                    ? 'bg-theme-primary/20 border-theme-primary text-theme-primary shadow-md scale-[1.02]' 
                                                    : 'bg-transparent border-theme-border text-theme-muted hover:border-theme-primary/50 hover:bg-theme-card'
                                                }`}
                                            >
                                                <div className={`p-2.5 rounded-lg mt-0.5 ${templateId === t.id ? 'bg-theme-primary text-white shadow-lg' : 'bg-theme-body border border-theme-border'}`}>
                                                    {t.icon}
                                                </div>
                                                <div>
                                                    <span className="block font-black text-sm text-theme-title">{t.label}</span>
                                                    <span className={`block text-xs mt-1 leading-snug ${templateId === t.id ? 'text-theme-primary font-medium' : 'text-theme-muted'}`}>
                                                        {t.desc}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cores Globais */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Cor do Tema
                                    </label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {[
                                            '#10b981', '#3b82f6', '#2563eb', '#6366f1', 
                                            '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e', 
                                            '#ef4444', '#f97316', '#f59e0b', '#eab308', 
                                            '#84cc16', '#14b8a6'
                                        ].map((color, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setNodeColor(color)}
                                                className={`w-full aspect-square rounded-full transition-all hover:scale-125 border shadow-sm ${nodeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-theme-card' : 'border-white/10'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-[1px] w-full bg-theme-border/30 my-2" />

                    {/* Seção Colapsável: Roadmap */}
                    <div className="flex flex-col gap-6 transition-all">
                        <button 
                            onClick={() => {
                                setIsRoadmapSectionOpen(!isRoadmapSectionOpen);
                                if (!isRoadmapSectionOpen) {
                                    setIsMindMapSectionOpen(false);
                                    // Se o texto for o padrão inicial ou estiver vazio, sugere o exemplo de Roadmap
                                    if (rawText.startsWith("Holding Global") || rawText.trim() === "") {
                                        setRawText("Roadmap de Desenvolvimento 2026\n  Fase de Planejamento {T1 2026} | Definição de escopo e arquitetura\n    Workshop UI/UX [Concluído]\n      Criação de Personas\n      Wireframes de Baixa Fidelidade\n    Especificação Técnica [Em Progresso] (40%)\n      Definição do Stack\n  Fase de Execução {T2 2026} | Desenvolvimento das features core\n    MVP do Backend [Não Iniciado]\n    Frontend Web [Não Iniciado]\n  Fase de Lançamento {T4 2026} | Testes e Go-to-market\n    Beta Fechado [Não Iniciado]\n    Campanha de Marketing [Não Iniciado]");
                                        setTemplateId('timeline');
                                    }
                                }
                            }}
                            className="flex items-center justify-between w-full py-2 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-black text-theme-title tracking-tight uppercase tracking-widest">Road map</span>
                            </div>
                            <div className="text-theme-muted group-hover:text-emerald-500 transition-colors">
                                {isRoadmapSectionOpen ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                            </div>
                        </button>

                        {isRoadmapSectionOpen && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Orientação */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Orientação do Mapa
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        <button 
                                            onClick={() => setLayoutDirection('vertical')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${layoutDirection === 'vertical' ? 'bg-emerald-500 text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <LayoutGrid className="w-4 h-4" /> Vertical
                                        </button>
                                        <button 
                                            onClick={() => setLayoutDirection('horizontal')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${layoutDirection === 'horizontal' ? 'bg-emerald-500 text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <ListTree className="w-4 h-4" /> Horizontal
                                        </button>
                                    </div>
                                </div>

                                {/* Modo de Cor */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Modo de Cor
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        <button 
                                            onClick={() => setColorMode('mono')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${colorMode === 'mono' ? 'bg-emerald-500 text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColor }} /> Mono
                                        </button>
                                        <button 
                                            onClick={() => setColorMode('multi')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${colorMode === 'multi' ? 'bg-emerald-500 text-white shadow-md' : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'}`}
                                        >
                                            <div className="flex -space-x-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-theme-body" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-theme-body" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-theme-body" />
                                            </div>
                                            Multi
                                        </button>
                                    </div>
                                </div>

                                {/* Cor das Linhas */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 block flex items-center gap-2">
                                        <Share2 className="w-3 h-3" /> Cor das Linhas
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        <button
                                            onClick={() => setEdgeColorMode('colored')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                                edgeColorMode === 'colored' 
                                                ? 'bg-emerald-500 text-white shadow-md' 
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                            }`}
                                        >
                                            <Palette className="w-3 h-3" /> Colorido
                                        </button>
                                        <button
                                            onClick={() => setEdgeColorMode('bw')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                                edgeColorMode === 'bw' 
                                                ? 'bg-emerald-500 text-white shadow-md' 
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                            }`}
                                        >
                                            <div className="w-3 h-3 border-2 border-theme-muted rounded-full" /> P&B
                                        </button>
                                    </div>
                                </div>

                                {/* Cores Globais */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Cor do Tema
                                    </label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {[
                                            '#10b981', '#3b82f6', '#2563eb', '#6366f1', 
                                            '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e', 
                                            '#ef4444', '#f97316', '#f59e0b', '#eab308', 
                                            '#84cc16', '#14b8a6'
                                        ].map((color, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setNodeColor(color)}
                                                className={`w-full aspect-square rounded-full transition-all hover:scale-125 border shadow-sm ${nodeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-theme-card' : 'border-white/10'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Seleção de Template de Roadmap */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Template de Roadmap
                                    </label>
                                    <div className="grid gap-3">
                                        {roadmapTemplates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTemplateId(t.id)}
                                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                                                    templateId === t.id 
                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-md scale-[1.02]' 
                                                    : 'bg-transparent border-theme-border text-theme-muted hover:border-emerald-500/50 hover:bg-theme-card'
                                                }`}
                                            >
                                                <div className={`p-2.5 rounded-lg mt-0.5 ${templateId === t.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-theme-body border border-theme-border'}`}>
                                                    {t.icon}
                                                </div>
                                                <div>
                                                    <span className="block font-black text-sm text-theme-title">{t.label}</span>
                                                    <span className={`block text-xs mt-1 leading-snug ${templateId === t.id ? 'text-emerald-500 font-medium' : 'text-theme-muted'}`}>
                                                        {t.desc}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-[1px] w-full bg-theme-border/30 my-2" />

                    <div className="h-[1px] w-full bg-theme-border/30 my-2" />

                    {/* Área de Input de Texto */}
                    <div className={`flex flex-col transition-all duration-300 relative ${isInputExpanded ? 'h-[500px]' : 'h-[300px]'}`}>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <label className="text-[10px] font-black text-theme-title uppercase tracking-widest opacity-70">
                                Hierarquia de Texto (Entrada)
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsInputExpanded(!isInputExpanded)}
                                    className="p-1.5 text-theme-muted hover:text-theme-primary hover:bg-theme-primary/10 rounded-md transition-all border border-transparent hover:border-theme-primary/20"
                                    title={isInputExpanded ? "Recolher Input" : "Expandir Input"}
                                >
                                    {isInputExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsHelpModalOpen(true)}
                                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-theme-primary hover:bg-theme-primary/10 rounded-lg transition-all border border-theme-primary/20"
                                >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    Exemplos
                                </button>
                            </div>
                        </div>
                        <textarea 
                            className="flex-1 w-full p-4 bg-black/20 border border-theme-border rounded-xl text-theme-main font-mono text-sm leading-relaxed focus:outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary resize-y custom-scrollbar shadow-inner"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Home\n  Página 1\n    Sub-página\nContato"
                            spellCheck={false}
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 bg-red-400/10 p-3 rounded-lg text-sm font-semibold border border-red-400/20">
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-theme-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(var(--color-primary),0.39)] hover:bg-theme-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                        {isGenerating ? "RENDERIZANDO..." : "GERAR MAPA VISUAL"}
                    </button>
                </div>

                {/* Painel Direito: Canvas do Grafo (Sitemap Render) */}
                <div className="flex-1 rounded-2xl border border-theme-border relative overflow-hidden shadow-2xl bg-theme-body/30">
                    
                    {graphData.nodes.length === 0 ? (
                        /* Estado Vazio */
                        <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                            <ListTree className="w-16 h-16 text-theme-muted/20 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-theme-muted/50">Nenhum Mapa Gerado</h3>
                            <p className="text-sm text-theme-muted/30 mt-2 max-w-sm text-center">
                                Edite o texto na barra lateral e clique em <strong className="text-theme-primary/50">Gerar Mapa</strong>.
                            </p>
                        </div>
                    ) : (
                        /* Canvas do React Flow ATIVO */
                        <SitemapRenderer 
                            rawNodes={graphData.nodes} 
                            rawEdges={graphData.edges} 
                            templateId={templateId}
                            layoutDirection={layoutDirection}
                            nodeColor={nodeColor}
                            colorMode={colorMode}
                            edgeColorMode={edgeColorMode}
                        />
                    )}
                </div>
            </div>

            {/* Modal de Ajuda (Exemplos de Indentação e JSON) */}
            <CustomHelpModal 
                isOpen={isHelpModalOpen} 
                onClose={() => setIsHelpModalOpen(false)} 
            />
        </div>
    );
};

export default SitemapBuilder;
