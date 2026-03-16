import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AlignLeft, Download, Layers, Play, Zap, HelpCircle, LayoutGrid, ListTree, Loader2, ChevronDown, ChevronRight, Plus, Minus, Share2, Palette, Eye, EyeOff, Monitor, PenTool, Cpu, Boxes, Type, TrendingUp, Box, Grid, Sparkles, Layout, Route, Map, History, FileJson, FileText, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
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
    const [rawText, setRawText] = useState("1- EMPRESA (TÍTULO)\n1.1- Nossos Serviços\n1.1.1- Consultoria Estratégica\n1.1.2- Desenvolvimento de Sistemas\n1.2- Soluções em Nuvem\n2- CASES DE SUCESSO\n2.1- Projeto Alpha\n2.2- Projeto Beta\n3- SOBRE NÓS\n4- CONTATO");
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

    // Core Logic States
    const [templateId, setTemplateId] = useState('mindmap'); // mindmap, sitemap, orgchart
    const [layoutDirection, setLayoutDirection] = useState('vertical'); // vertical, horizontal
    const [nodeColor, setNodeColor] = useState('#3b82f6'); // Cor padrão (Azul)
    const [colorMode, setColorMode] = useState<'mono' | 'multi'>('mono');
    const [edgeColorMode, setEdgeColorMode] = useState<'colored' | 'bw'>('colored');
    const [spacing, setSpacing] = useState('m'); // pp, p, m, g, gg
    const [edgeWidth, setEdgeWidth] = useState('m'); // pp, p, m, g, gg

    // History for Undo (Ctrl+Z)
    const [history, setHistory] = useState<string[]>([]);
    const MAX_HISTORY = 50;

    const sitemapRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<any>(null);

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

    // Function to handle rawText change with history
    const updateRawText = (newText: string) => {
        setHistory(prev => {
            const last = prev[prev.length - 1];
            if (last === rawText) return prev;
            const newHistory = [...prev, rawText];
            return newHistory.slice(-MAX_HISTORY);
        });
        setRawText(newText);
    };

    // Undo function
    const handleUndo = useCallback(() => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setRawText(previous);
    }, [history]);

    // Keyboard Shortcuts (Ctrl+Z)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo]);

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

    const downloadData = (format: 'txt' | 'json') => {
        const content = format === 'json' ? JSON.stringify(graphData, null, 2) : rawText;
        const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sitemap.${format}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadImage = async () => {
        if (!sitemapRef.current || !rendererRef.current) return;
        try {
            const bounds = rendererRef.current.getBounds();
            const currentNodes = rendererRef.current.getNodes();
            if (!bounds || currentNodes.length === 0) return;

            const panelEl = sitemapRef.current;
            const panelWidth = panelEl.offsetWidth;
            const panelHeight = panelEl.offsetHeight;
            const padding = 80;

            // Calcula o zoom para fazer todos os nós caberem no painel com padding
            const zoomX = (panelWidth - padding * 2) / bounds.width;
            const zoomY = (panelHeight - padding * 2) / bounds.height;
            const fitZoom = Math.min(zoomX, zoomY, 2); // Limita a 2x para não exagerar

            // Centraliza o conteúdo no painel com o zoom calculado
            const scaledW = bounds.width * fitZoom;
            const scaledH = bounds.height * fitZoom;
            const viewportX = (panelWidth - scaledW) / 2 - bounds.x * fitZoom;
            const viewportY = (panelHeight - scaledH) / 2 - bounds.y * fitZoom;

            // Salva o viewport atual para restaurar depois
            const originalViewport = rendererRef.current.getViewport();

            // Aplica o viewport de captura
            rendererRef.current.setViewport({ x: viewportX, y: viewportY, zoom: fitZoom });

            // Aguarda o React renderizar o novo viewport (2 frames)
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            // Captura o painel em alta resolução: 4x = zoom sem perda de nitidez
            const PIXEL_RATIO = 4;
            const dataUrl = await toPng(panelEl, {
                backgroundColor: '#0f172a',
                quality: 1,
                pixelRatio: PIXEL_RATIO,
                width: panelWidth,
                height: panelHeight,
                style: { width: `${panelWidth}px`, height: `${panelHeight}px` },
                filter: (node: any) => {
                    const exclusionClasses = [
                        'react-flow__controls',
                        'react-flow__panel',
                        'react-flow__background',
                        'react-flow__attribution',
                        'react-flow__minimap'
                    ];
                    return !(node.classList && exclusionClasses.some(cls => node.classList.contains(cls)));
                }
            });

            // Restaura o viewport original
            rendererRef.current.setViewport(originalViewport);

            const link = document.createElement('a');
            link.download = 'mapa-hd.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Erro ao gerar imagem:', err);
            setError("Erro ao exportar imagem. Tente reduzir o tamanho do mapa ou fechar outras abas.");
        }
    };

    const downloadHTML = async () => {
        if (!sitemapRef.current || !rendererRef.current) return;
        try {
            const bounds = rendererRef.current.getBounds();
            const currentNodes = rendererRef.current.getNodes();
            if (!bounds || currentNodes.length === 0) return;

            const panelEl = sitemapRef.current;
            const panelWidth = panelEl.offsetWidth;
            const panelHeight = panelEl.offsetHeight;
            const padding = 80;

            const zoomX = (panelWidth - padding * 2) / bounds.width;
            const zoomY = (panelHeight - padding * 2) / bounds.height;
            const fitZoom = Math.min(zoomX, zoomY, 2);
            const scaledW = bounds.width * fitZoom;
            const scaledH = bounds.height * fitZoom;
            const viewportX = (panelWidth - scaledW) / 2 - bounds.x * fitZoom;
            const viewportY = (panelHeight - scaledH) / 2 - bounds.y * fitZoom;

            const originalViewport = rendererRef.current.getViewport();
            rendererRef.current.setViewport({ x: viewportX, y: viewportY, zoom: fitZoom });
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            // Captura o SVG do mapa atual para embedar diretamente no HTML
            const { toSvg } = await import('html-to-image');
            const svgDataUrl = await toSvg(panelEl, {
                backgroundColor: '#0f172a',
                width: panelWidth,
                height: panelHeight,
                style: { width: `${panelWidth}px`, height: `${panelHeight}px` },
                filter: (node: any) => {
                    const exclusionClasses = ['react-flow__controls', 'react-flow__panel', 'react-flow__background', 'react-flow__attribution', 'react-flow__minimap'];
                    return !(node.classList && exclusionClasses.some(cls => node.classList.contains(cls)));
                }
            });

            rendererRef.current.setViewport(originalViewport);

            // Extrai o SVG em string do data URL
            let svgContent: string;
            if (svgDataUrl.includes('base64,')) {
                svgContent = atob(svgDataUrl.split('base64,')[1]);
            } else {
                svgContent = decodeURIComponent(svgDataUrl.split(',').slice(1).join(','));
            }

            const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mapa Interativo</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f172a; width: 100vw; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        #map-container { width: 100%; height: 100%; cursor: grab; display: flex; align-items: center; justify-content: center; }
        #map-container:active { cursor: grabbing; }
        #map-container svg { width: 100%; height: 100%; display: block; }
        .hint { position: fixed; bottom: 16px; right: 16px; background: rgba(30,41,59,0.8); color: #94a3b8; font-size: 11px; padding: 8px 12px; border-radius: 8px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08); font-family: system-ui, sans-serif; }
    </style>
</head>
<body>
    <div id="map-container">
        ${svgContent}
    </div>
    <div class="hint">🖱 Arraste para mover · Scroll para zoom</div>
    <script src="https://cdn.jsdelivr.net/npm/@panzoom/panzoom@4/dist/panzoom.min.js"></script>
    <script>
        const el = document.querySelector('#map-container svg');
        if (el) {
            const pz = Panzoom(el, { maxScale: 8, minScale: 0.2, contain: 'outside', step: 0.15 });
            document.getElementById('map-container').addEventListener('wheel', pz.zoomWithWheel);
        }
    </script>
</body>
</html>`;

            const blob = new Blob([htmlTemplate], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mapa-interativo.html';
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao gerar HTML:', err);
            setError('Erro ao exportar HTML.');
        }
    };

    const downloadSVG = async () => {
        if (!sitemapRef.current || !rendererRef.current) return;
        try {
            const bounds = rendererRef.current.getBounds();
            const currentNodes = rendererRef.current.getNodes();
            if (!bounds || currentNodes.length === 0) return;

            const panelEl = sitemapRef.current;
            const panelWidth = panelEl.offsetWidth;
            const panelHeight = panelEl.offsetHeight;
            const padding = 80;

            const zoomX = (panelWidth - padding * 2) / bounds.width;
            const zoomY = (panelHeight - padding * 2) / bounds.height;
            const fitZoom = Math.min(zoomX, zoomY, 2);
            const scaledW = bounds.width * fitZoom;
            const scaledH = bounds.height * fitZoom;
            const viewportX = (panelWidth - scaledW) / 2 - bounds.x * fitZoom;
            const viewportY = (panelHeight - scaledH) / 2 - bounds.y * fitZoom;

            const originalViewport = rendererRef.current.getViewport();
            rendererRef.current.setViewport({ x: viewportX, y: viewportY, zoom: fitZoom });
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            // Captura usando toSvg da html-to-image (mesma lib, diferente formato)
            const { toSvg } = await import('html-to-image');
            const svgDataUrl = await toSvg(panelEl, {
                backgroundColor: '#0f172a',
                width: panelWidth,
                height: panelHeight,
                style: { width: `${panelWidth}px`, height: `${panelHeight}px` },
                filter: (node: any) => {
                    const exclusionClasses = ['react-flow__controls', 'react-flow__panel', 'react-flow__background', 'react-flow__attribution', 'react-flow__minimap'];
                    return !(node.classList && exclusionClasses.some(cls => node.classList.contains(cls)));
                }
            });

            rendererRef.current.setViewport(originalViewport);

            const link = document.createElement('a');
            link.download = 'mapa-vetorial.svg';
            link.href = svgDataUrl;
            link.click();
        } catch (err) {
            console.error('Erro ao gerar SVG:', err);
            setError('Erro ao exportar SVG.');
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
                                    const roadmapKeywords = ["Fase", "Roadmap", "Sprint", "Sprint 1", "Marcos"];
                                    if (roadmapKeywords.some(s => rawText.includes(s))) {
                                        setRawText("1- EMPRESA (TÍTULO)\n1.1- Nossos Serviços\n1.1.1- Consultoria Estratégica\n1.1.2- Desenvolvimento de Sistemas\n1.2- Soluções em Nuvem\n2- CASES DE SUCESSO\n2.1- Projeto Alpha\n2.2- Projeto Beta\n3- SOBRE NÓS\n4- CONTATO");
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

                                {/* Espaçamento */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Espaçamento
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        {['pp', 'p', 'm', 'g', 'gg'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setSpacing(s)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${spacing === s
                                                    ? 'bg-theme-primary text-white shadow-md'
                                                    : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
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
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${edgeColorMode === 'colored'
                                                ? 'bg-theme-primary text-white shadow-md'
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                }`}
                                        >
                                            <Palette className="w-3 h-3" /> Colorido
                                        </button>
                                        <button
                                            onClick={() => setEdgeColorMode('bw')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${edgeColorMode === 'bw'
                                                ? 'bg-theme-primary text-white shadow-md'
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                }`}
                                        >
                                            <div className="w-3 h-3 border-2 border-theme-muted rounded-full" /> P&B
                                        </button>
                                    </div>
                                </div>

                                {/* Largura das Linhas */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Largura das Linhas
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        {['pp', 'p', 'm', 'g', 'gg'].map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => setEdgeWidth(w)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${edgeWidth === w
                                                    ? 'bg-theme-primary text-white shadow-md'
                                                    : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                    }`}
                                            >
                                                {w}
                                            </button>
                                        ))}
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
                                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${templateId === t.id
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
                                    if (rawText.includes("EMPRESA") || rawText.trim() === "") {
                                        setRawText("Roadmap de Expansão de Mercado 2026\n  Fase 1: Pesquisa e Planejamento {T1} | Análise de concorrência e público\n    Estudo de Viabilidade Econômica [Concluído]\n      Análise SWOT (80%)\n      Benchmark Competitivo (100%)\n    Pesquisa de UX e Recomendações [Em Progresso]\n      Testes com Usuários (60%)\n      Relatório de Acessibilidade (40%)\n  Fase 2: Infraestrutura e Tecnologia {T2} | Setup de servidores e APIs\n    Deploy do Core do Sistema [Não Iniciado]\n      Config. de Ambiente Cloud (0%)\n      Pipeline de CI/CD (0%)\n    Integração com Gateway de Pagamento [Não Iniciado]\n      Stripe API (0%)\n      Fallback Pix (0%)\n  Fase 3: Lançamento e Marketing {Q3} | Campanhas de aquisição\n    Campanha de Tráfego Pago [Não Iniciado]\n      Google Ads (0%)\n      Meta Ads (0%)\n    Evento de Lançamento Digital [Não Iniciado]\n      Live no YouTube (0%)\n      Webinar com Parceiros (0%)");
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

                                {/* Espaçamento */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Espaçamento
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        {['pp', 'p', 'm', 'g', 'gg'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setSpacing(s)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${spacing === s
                                                    ? 'bg-emerald-500 text-white shadow-md'
                                                    : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
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
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${edgeColorMode === 'colored'
                                                ? 'bg-emerald-500 text-white shadow-md'
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                }`}
                                        >
                                            <Palette className="w-3 h-3" /> Colorido
                                        </button>
                                        <button
                                            onClick={() => setEdgeColorMode('bw')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${edgeColorMode === 'bw'
                                                ? 'bg-emerald-500 text-white shadow-md'
                                                : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                }`}
                                        >
                                            <div className="w-3 h-3 border-2 border-theme-muted rounded-full" /> P&B
                                        </button>
                                    </div>
                                </div>

                                {/* Largura das Linhas */}
                                <div>
                                    <label className="block text-xs font-bold text-theme-title uppercase tracking-wider mb-3">
                                        Largura das Linhas
                                    </label>
                                    <div className="flex bg-theme-body p-1 rounded-xl border border-theme-border/50">
                                        {['pp', 'p', 'm', 'g', 'gg'].map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => setEdgeWidth(w)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${edgeWidth === w
                                                    ? 'bg-emerald-500 text-white shadow-md'
                                                    : 'text-theme-muted hover:text-theme-title hover:bg-theme-sidebar/50'
                                                    }`}
                                            >
                                                {w}
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
                                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${templateId === t.id
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
                                    onClick={() => {
                                        setRawText("ESTRUTURA ORGANIZACIONAL\n1- DIRETORIA EXECUTIVA\n1.1- VP de Operações\n1.1.1- Gerente de Logística\n1.2- VP de Tecnologia\n1.2.1- Gerente de Engenharia\n2- DEPARTAMENTO COMERCIAL\n2.1- Vendas Diretas\n2.2- Key Accounts\n3- RECURSOS HUMANOS");
                                        handleGenerate();
                                    }}
                                    className="px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-theme-muted hover:text-theme-primary hover:bg-theme-primary/10 rounded-lg transition-all border border-theme-border/50 hover:border-theme-primary/30"
                                    title="Exemplo: Estrutura Organizacional"
                                >
                                    Exemplo 2
                                </button>
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
                            onChange={(e) => updateRawText(e.target.value)}
                            placeholder="1- Home\n1.1- Página 1\n1.1.1- Sub-página\n2- Contato"
                            spellCheck={false}
                        />
                    </div>

                    {/* Download e Ferramentas */}
                    <div className="bg-theme-card/30 p-4 rounded-xl border border-theme-border/50">
                        <label className="block text-[10px] font-black text-theme-title uppercase tracking-widest opacity-70 mb-3 flex items-center gap-2">
                            <Download className="w-3 h-3" /> Ferramentas e Exportação
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={downloadImage}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-theme-body border border-theme-border/50 text-theme-title text-[10px] font-bold uppercase hover:bg-theme-sidebar/50 transition-all hover:shadow-md group"
                                title="Exportar como Imagem PNG"
                            >
                                <ImageIcon className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                                PNG
                            </button>
                            <button
                                onClick={downloadHTML}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-theme-body border border-theme-border/50 text-theme-title text-[10px] font-bold uppercase hover:bg-theme-sidebar/50 transition-all hover:shadow-md group"
                                title="Exportar como HTML Interativo"
                            >
                                <Layout className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                                HTML
                            </button>
                            <button
                                onClick={downloadSVG}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-theme-body border border-theme-border/50 text-theme-title text-[10px] font-bold uppercase hover:bg-theme-sidebar/50 transition-all hover:shadow-md group"
                                title="Exportar como SVG Vetorial (ideal para apresentações)"
                            >
                                <Share2 className="w-3.5 h-3.5 text-orange-500 group-hover:scale-110 transition-transform" />
                                SVG
                            </button>
                            <button
                                onClick={() => downloadData('txt')}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-theme-body border border-theme-border/50 text-theme-title text-[10px] font-bold uppercase hover:bg-theme-sidebar/50 transition-all hover:shadow-md group"
                                title="Baixar Texto Bruto"
                            >
                                <FileText className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                TXT
                            </button>
                            <button
                                onClick={() => downloadData('json')}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-theme-body border border-theme-border/50 text-theme-title text-[10px] font-bold uppercase hover:bg-theme-sidebar/50 transition-all hover:shadow-md group"
                                title="Baixar Dados Estruturados (JSON)"
                            >
                                <FileJson className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                                JSON
                            </button>
                            <button
                                onClick={handleUndo}
                                disabled={history.length === 0}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl bg-theme-body border border-theme-border/50 text-[10px] font-bold uppercase transition-all hover:shadow-md group ${history.length === 0 ? 'opacity-30 cursor-not-allowed' : 'text-theme-title hover:bg-theme-sidebar/50'}`}
                                title="Desfazer última alteração (Ctrl+Z)"
                            >
                                <History className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                                Undo
                            </button>
                        </div>
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
                <div className="flex-1 rounded-2xl border border-theme-border relative overflow-hidden shadow-2xl bg-theme-body/30" ref={sitemapRef}>

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
                            ref={rendererRef}
                            rawNodes={graphData.nodes}
                            rawEdges={graphData.edges}
                            templateId={templateId}
                            layoutDirection={layoutDirection}
                            nodeColor={nodeColor}
                            colorMode={colorMode}
                            edgeColorMode={edgeColorMode}
                            spacing={spacing}
                            edgeWidth={edgeWidth}
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
