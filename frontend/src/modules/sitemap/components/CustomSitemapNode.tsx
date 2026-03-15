import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ChevronDown, ChevronRight, Plus, Minus, LayoutGrid, ListTree, AlignLeft, Play, Zap, Layers, Box, Activity, Grid, Sparkles, TrendingUp, Route, Map as MapIcon, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomNodeProps {
    data: {
        label: string;
        isRoot?: boolean;
        hasChildren?: boolean;
        isCollapsed?: boolean;
        onToggleCollapse?: (nodeId: string) => void;
        sourcePosition?: Position;
        targetPosition?: Position;
        templateId?: string;
        depth: number;
        childCount?: number;
        nodeColor?: string;
        status?: string;
        timeline?: string;
        progress?: string;
        description?: string;
        index: number;
    };
    id: string;
}

const CustomSitemapNode = ({ data, id }: CustomNodeProps) => {
    const {
        label,
        isRoot,
        hasChildren,
        isCollapsed,
        onToggleCollapse,
        sourcePosition = Position.Bottom,
        targetPosition = Position.Top,
        templateId = 'mindmap',
        depth = 0,
        childCount = 0,
        nodeColor = '#3b82f6', // Cor padrão vinda do Builder
        status,
        timeline,
        progress,
        description,
        index = 0
    } = data;

    const isHorizontal = targetPosition === Position.Left || targetPosition === Position.Right;

    const handleNodeClick = (e: React.MouseEvent) => {
        if (hasChildren && onToggleCollapse) {
            e.stopPropagation();
            onToggleCollapse(id);
        }
    };

    // --- HELPER: PROGRESS BAR ---
    const ProgressBar = ({ value, color }: { value: string | undefined, color: string }) => {
        if (!value) return null;
        const num = parseInt(value);
        if (isNaN(num)) return null;
        return (
            <div className="w-full h-2 bg-theme-sidebar shadow-inner rounded-full mt-2 overflow-hidden border border-theme-border/20 relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${num}%` }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ backgroundColor: color }}
                >
                    {/* Efeito de Brilho (Shimmer) */}
                    <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                </motion.div>
            </div>
        );
    };

    // --- ROADMAP TEMPLATE 1: TIMELINE (INFOGRAPHIC STYLE - FIGURA 4) ---
    if (templateId === 'timeline') {
        const isHorizontalLayout = targetPosition === Position.Left || targetPosition === Position.Right;
        const isEven = index % 2 === 0;

        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleNodeClick}
                className={`flex ${isHorizontalLayout ? 'flex-col items-center' : 'flex-row items-center'} group relative ${hasChildren ? 'cursor-pointer' : ''}`}
            >
                <Handle type="target" position={targetPosition} className="opacity-0" />
                
                {/* Linha do Tempo Central (Fundo) */}
                <div className={`${isHorizontalLayout ? 'w-[150%] h-[4px] absolute top-[50%] -translate-y-1/2 left-[-25%]' : 'h-[150%] w-[4px] absolute left-[50%] -translate-x-1/2 top-[-25%]'} bg-theme-border/30 z-0`} />

                {/* Conteúdo Alternado (Acima/Abaixo ou Lado/Lado) */}
                <div className={`relative flex ${isHorizontalLayout ? (isEven ? 'flex-col-reverse mb-32' : 'flex-col mt-32') : (isEven ? 'flex-row-reverse -ml-40' : 'flex-row ml-40')} items-center gap-4 z-20`}>
                    
                    {/* Linha de Conexão com a Bolha */}
                    <div className={`absolute ${isHorizontalLayout ? (isEven ? 'bottom-[-60px]' : 'top-[-60px]') : (isEven ? 'right-[-60px]' : 'left-[-60px]')} ${isHorizontalLayout ? 'w-[2px] h-[60px]' : 'w-[60px] h-[2px]'} bg-theme-border`} />

                    {/* Card de Conteúdo */}
                    <div className="bg-theme-card border-2 p-5 rounded-2xl shadow-2xl min-w-[200px] backdrop-blur-md relative" style={{ borderColor: nodeColor }}>
                        {timeline && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-primary mb-2 block">{timeline}</span>
                        )}
                        <h4 className="text-theme-title font-bold text-sm leading-tight mb-2">{label}</h4>
                        {description && <p className="text-[10px] text-theme-muted leading-relaxed italic mb-3">"{description}"</p>}
                        <ProgressBar value={progress} color={nodeColor} />
                    </div>

                    {/* Bolha/Ícone na Linha Central */}
                    <div className={`absolute ${isHorizontalLayout ? (isEven ? 'bottom-[-74px]' : 'top-[-74px]') : (isEven ? 'right-[-74px]' : 'left-[-74px]')} w-12 h-12 rounded-full border-[4px] shadow-[0_0_20px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all bg-theme-sidebar z-30`}
                         style={{ borderColor: nodeColor }}>
                        <Zap className="w-5 h-5" style={{ color: nodeColor }} />
                    </div>
                </div>

                <Handle type="source" position={sourcePosition} className="opacity-0" />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 2: MILESTONE (PREMIUM BAR) ---
    if (templateId === 'milestone') {
        return (
            <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNodeClick}
                className={`w-[280px] group ${hasChildren ? 'cursor-pointer' : ''} relative`}
            >
                <Handle type="target" position={targetPosition} className="opacity-0" />
                
                <div className="bg-theme-card border-x-4 border-t-8 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all" style={{ borderColor: nodeColor }}>
                    <div className="px-6 py-4 flex items-center justify-between bg-black/10 border-b border-white/5">
                        <span className="text-[14px] font-black text-white italic tracking-tighter opacity-80">{timeline || 'PHASE'}</span>
                        <Layers className="w-4 h-4 opacity-40 group-hover:rotate-12 transition-transform" />
                    </div>
                    
                    <div className="p-6 bg-theme-card">
                        <h4 className="text-theme-title font-black text-lg tracking-tighter mb-4 leading-none">{label}</h4>
                        {description && <p className="text-[10px] text-theme-muted mb-5 italic line-clamp-2 leading-relaxed opacity-70">{description}</p>}
                        
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-[9px] font-black uppercase text-theme-muted tracking-widest">Progress</span>
                             <span className="text-[10px] font-bold" style={{ color: nodeColor }}>{progress || '0%'}</span>
                        </div>
                        <ProgressBar value={progress} color={nodeColor} />
                    </div>
                </div>

                {status && (
                    <div className="absolute -bottom-3 left-6 bg-white text-black px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl border-2 z-10" style={{ borderColor: nodeColor }}>
                        {status}
                    </div>
                )}

                <Handle type="source" position={sourcePosition} className="opacity-0" />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 3: PRO GANTT (FIGURAS 1 E 3) ---
    if (templateId === 'gantt') {
        return (
            <motion.div 
                whileHover={{ scale: 1.02, x: 10 }}
                onClick={handleNodeClick}
                className={`w-[320px] bg-[#f8fafc] border-2 border-slate-200 rounded-xl overflow-hidden flex flex-col group shadow-lg ${hasChildren ? 'cursor-pointer' : ''} text-[#1e293b]`}
            >
                <Handle type="target" position={targetPosition} className="opacity-0" />
                
                <div className="px-6 py-4 flex items-center gap-4 bg-white border-b border-slate-100">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md shrink-0" style={{ backgroundColor: nodeColor }}>
                        <Play className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-xs uppercase tracking-tight text-slate-800 line-clamp-1">{label}</span>
                            {timeline && <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">{timeline}</span>}
                        </div>
                        {description && <p className="text-[10px] text-slate-500 font-medium italic mt-0.5 line-clamp-1">"{description}"</p>}
                    </div>
                </div>

                <div className="p-6 bg-[#f1f5f9]/50 relative">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progress Metrics</span>
                        <span className="text-xs font-black" style={{ color: nodeColor }}>{progress || '0%'}</span>
                    </div>
                    
                    {/* Barra Estilo Pro Gantt */}
                    <div className="h-6 bg-slate-200 rounded-lg relative overflow-hidden shadow-inner border border-slate-300/50">
                        {/* Grid de fundo */}
                        <div className="absolute inset-0 flex">
                            {[1,2,3,4].map(i => <div key={i} className="flex-1 border-r border-slate-300 last:border-none" />)}
                        </div>
                        
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: progress || '0%' }}
                            className="h-full relative z-10 flex items-center justify-end px-2 shadow-lg"
                            style={{ backgroundColor: nodeColor }}
                        >
                            <div className="w-1 h-3 bg-white/40 rounded-full" />
                        </motion.div>
                    </div>

                    <div className="flex justify-between mt-4">
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />)}
                        </div>
                        {status && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white border border-slate-200 shadow-sm text-slate-600">
                                {status}
                            </span>
                        )}
                    </div>
                </div>
                
                <Handle type="source" position={sourcePosition} className="opacity-0" />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 4: MARKETING WAVE (S-CURVE - FIGURA 1) ---
    if (templateId === 'wave') {
        const isUp = index % 2 === 0;

        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col items-center group relative ${hasChildren ? 'cursor-pointer' : ''} min-w-[320px] z-20 h-[400px] justify-center`}
                onClick={handleNodeClick}
            >
                <Handle type="target" position={targetPosition} className="opacity-0" />
                
                <div 
                    className={`w-[240px] h-[120px] border-[16px] relative flex items-center justify-center transition-all ${isUp ? 'rounded-t-[120px] border-b-0 -translate-y-[60px]' : 'rounded-b-[120px] border-t-0 translate-y-[60px]'}`}
                    style={{ borderColor: nodeColor }}
                >
                    <span className={`text-4xl font-black uppercase tracking-tighter ${isUp ? 'mt-4' : 'mb-4'}`} style={{ color: nodeColor }}>
                        {label.slice(0, 3)}
                    </span>
                    <div className={`absolute ${isUp ? 'bottom-0 right-[-8px]' : 'top-0 right-[-8px]'} w-4 h-4 rounded-full bg-white border-2`} style={{ borderColor: nodeColor }} />
                </div>

                <div className={`absolute ${isUp ? 'bottom-0' : 'top-0'} w-[280px] flex flex-col gap-3 p-4 bg-theme-card/30 rounded-2xl border border-white/5`}>
                   <div className="flex flex-col border-l-4 pl-4" style={{ borderColor: nodeColor }}>
                        <span className="text-[11px] font-black uppercase tracking-wider opacity-60" style={{ color: nodeColor }}>{timeline || 'Strategic Phase'}</span>
                         <h4 className="text-md font-black text-theme-title leading-tight mt-1 uppercase italic tracking-tighter">{label}</h4>
                   </div>
                   {description && (
                       <div className="flex flex-col gap-2 mt-1">
                           <div className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: nodeColor }} />
                               <p className="text-[11px] text-theme-muted font-medium leading-relaxed">{description}</p>
                           </div>
                       </div>
                   )}
                   <div className="mt-2 pt-3 border-t border-theme-border/20">
                        {status && (
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black text-theme-muted uppercase tracking-widest">Global Status</span>
                                <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded shadow-sm italic" style={{ backgroundColor: nodeColor }}>{status}</span>
                            </div>
                        )}
                        <ProgressBar value={progress} color={nodeColor} />
                   </div>
                </div>

                <Handle type="source" position={sourcePosition} className="opacity-0" />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 5: ISOMETRIC 3D ---
    if (templateId === 'isometric') {
        return (
            <motion.div 
                whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
                onClick={handleNodeClick}
                className={`w-[260px] group ${hasChildren ? 'cursor-pointer' : ''} relative perspective-1000`}
            >
                <Handle type="target" position={targetPosition} className="opacity-0" />
                
                <div className="relative transform-style-3d">
                    {/* Sombra Isométrica */}
                    <div className="absolute inset-0 bg-black/40 translate-x-4 translate-y-4 blur-xl rounded-xl" />
                    
                    <div className="bg-theme-card border-l-[10px] border-b-[6px] p-6 rounded-xl relative shadow-2xl transition-all"
                         style={{ borderLeftColor: nodeColor, borderBottomColor: `${nodeColor}99` }}>
                        
                        <div className="flex flex-col gap-1">
                            {timeline && <span className="text-[10px] font-black text-theme-primary uppercase italic">{timeline}</span>}
                            <h4 className="text-theme-title font-black text-lg tracking-tighter leading-none mb-4">{label}</h4>
                        </div>
                        
                        <div className="p-3 bg-black/20 rounded-lg mb-4">
                             <ProgressBar value={progress} color={nodeColor} />
                        </div>

                        {description && <p className="text-[10px] text-theme-muted line-clamp-2 italic">"{description}"</p>}
                        
                        {/* Detalhe Decorativo 3D */}
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-theme-sidebar border-2 border-theme-border flex items-center justify-center rotate-12 shadow-lg"
                             style={{ borderColor: nodeColor }}>
                            <Box className="w-4 h-4" style={{ color: nodeColor }} />
                        </div>
                    </div>
                </div>

                <Handle type="source" position={sourcePosition} className="opacity-0" />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 6: NEON CIRCUIT (REMOVIDO) ---

    // --- ROADMAP TEMPLATE 7: MINIMAL EXECUTIVE (UNIFICADO) ---
    if (templateId === 'minimal') {
        return (
            <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={handleNodeClick}
                className={`w-[320px] bg-theme-card border-2 border-theme-border/30 p-8 rounded-3xl group ${hasChildren ? 'cursor-pointer' : ''} shadow-lg hover:shadow-2xl transition-all relative overflow-hidden`}
            >
                <Handle type="target" position={targetPosition} className="!w-4 !h-4 !bg-theme-card !border-2 !border-theme-border shadow-sm" />
                
                {/* Subtle Accent Line */}
                <div className="absolute top-0 left-0 w-1.5 h-full opacity-60" style={{ backgroundColor: nodeColor }} />

                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em]">{timeline || 'Phase Schedule'}</span>
                         <Layout className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-colors" />
                    </div>
                    <h4 className="text-2xl font-black tracking-tighter text-theme-title leading-none mb-2">{label}</h4>
                </div>

                {description && <p className="text-[11px] text-theme-muted font-medium leading-relaxed italic mb-4 line-clamp-2">{description}</p>}
                
                <div className="mt-auto pt-4 border-t border-theme-border/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest">{status || 'Ongoing'}</span>
                        <span className="text-sm font-black text-theme-title">{progress || '0%'}</span>
                    </div>
                    <div className="h-2 bg-theme-sidebar/50 rounded-full overflow-hidden p-[2px]">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: progress || '0%' }}
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ backgroundColor: nodeColor }}
                        />
                    </div>
                </div>

                <Handle type="source" position={sourcePosition} className="!w-4 !h-4 !bg-theme-card !border-2 !border-theme-border shadow-sm" />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 8: BLUEPRINT TECH (UNIFICADO) ---
    if (templateId === 'blueprint') {
        return (
            <motion.div 
                whileHover={{ scale: 1.02, rotate: 0.5 }}
                onClick={handleNodeClick}
                className={`w-[300px] bg-theme-card/80 backdrop-blur-sm border-2 border-theme-border p-6 rounded-lg group ${hasChildren ? 'cursor-pointer' : ''} relative overflow-hidden shadow-xl`}
            >
                {/* Background Grid Adaptável */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    color: nodeColor || '#3b82f6'
                }} />
                
                <Handle type="target" position={targetPosition} className="!w-3 !h-3 !bg-theme-card !border-2" style={{ borderColor: nodeColor }} />

                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b pb-3 border-theme-border/20">
                         <div className="px-2 py-0.5 border rounded text-[9px] font-mono font-bold uppercase tracking-widest bg-theme-sidebar" style={{ color: nodeColor, borderColor: `${nodeColor}44` }}>
                            COORD_{index+1}.V
                        </div>
                        <Grid className="w-4 h-4 opacity-40" />
                    </div>

                    <h4 className="text-theme-title font-mono text-lg font-black leading-tight uppercase italic">{label}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-theme-muted font-black uppercase tracking-tighter">Timeline_Target</span>
                            <span className="text-xs text-theme-title font-mono font-bold">{timeline || 'TBD_STK'}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                             <span className="text-[8px] text-theme-muted font-black uppercase tracking-tighter">Status_Flag</span>
                             <span className="text-xs text-theme-title font-mono font-bold uppercase" style={{ color: nodeColor }}>{status || 'PEND'}</span>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-mono opacity-40">PROGRESS_METRIC</span>
                            <span className="text-xs font-mono font-black">{progress || '0%'}</span>
                        </div>
                        <div className="h-4 border p-0.5 bg-theme-sidebar/30" style={{ borderColor: `${nodeColor}66` }}>
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: progress || '0%' }}
                                className="h-full opacity-60 relative overflow-hidden"
                                style={{ backgroundColor: nodeColor }}
                            >
                                <div className="absolute inset-0 translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </motion.div>
                        </div>
                    </div>

                    {description && <p className="text-[10px] text-theme-muted font-mono leading-relaxed mt-2 border-l-2 pl-3" style={{ borderColor: `${nodeColor}44` }}>SPEC_{index}: {description}</p>}
                </div>

                <Handle type="source" position={sourcePosition} className="!w-3 !h-3 !bg-theme-card !border-2" style={{ borderColor: nodeColor }} />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 9: GLASSMORPHISM PREMIUM ---
    if (templateId === 'glass') {
        return (
            <motion.div 
                whileHover={{ y: -12, scale: 1.03 }}
                onClick={handleNodeClick}
                className={`w-[320px] bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] group ${hasChildren ? 'cursor-pointer' : ''} relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]`}
            >
                <Handle type="target" position={targetPosition} className="!w-3 !h-3 !border-2 !border-white/50" style={{ backgroundColor: nodeColor }} />
                
                {/* Glow de fundo */}
                <div className="absolute -top-10 -right-10 w-32 h-32 blur-[80px] rounded-full opacity-30" style={{ backgroundColor: nodeColor }} />

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-white/60" />
                            <span className="text-[10px] text-white/60 font-black uppercase tracking-[0.25em]">{status || 'PREMIUM'}</span>
                        </div>
                        {timeline && <span className="text-[10px] font-bold text-white px-3 py-1 bg-white/10 rounded-full border border-white/10">{timeline}</span>}
                    </div>

                    <h4 className="text-2xl font-black text-white leading-none tracking-tighter mb-4">{label}</h4>
                    
                    {description && <p className="text-xs text-white/50 font-medium leading-relaxed mb-6">{description}</p>}
                    
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 shadow-inner">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-black text-white/40 uppercase">Completion</span>
                            <span className="text-xs font-black text-white">{progress || '0%'}</span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: progress || '0%' }}
                                className="h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-gradient-to-r from-white/20 to-white"
                            />
                        </div>
                    </div>
                </div>

                <Handle type="source" position={sourcePosition} className="!w-3 !h-3 !border-2 !border-white/50" style={{ backgroundColor: nodeColor }} />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 10: WINDING ROAD (ESTRADA SINUOSA) ---
    if (templateId === 'winding') {
        return (
            <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={handleNodeClick}
                className={`flex flex-col items-center group relative ${hasChildren ? 'cursor-pointer' : ''} min-w-[280px]`}
            >
                <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3 !border-none" />
                
                {/* O Bloco de Estrada (Asfalto) */}
                <div className="bg-[#334155] border-x-[12px] border-amber-500/30 p-6 rounded-3xl relative shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
                    {/* Linha Central da Estrada (Paint Marks) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full flex flex-col gap-4 opacity-40">
                        <div className="w-full h-8 bg-white" />
                        <div className="w-full h-8 bg-white" />
                        <div className="w-full h-8 bg-white" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                                <Route className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Checkpoint</span>
                                <h4 className="text-white font-black text-lg tracking-tight mt-1 leading-none">{label}</h4>
                            </div>
                        </div>

                        {description && (
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic line-clamp-2">"{description}"</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-bold text-white/50">{timeline || 'Phase'}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-amber-500 uppercase">{progress || '0%'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3 !border-none" />
            </motion.div>
        );
    }

    // --- ROADMAP TEMPLATE 11: ZIG-ZAG TRAIL ---
    if (templateId === 'zigzag') {
        const isRight = (depth || 0) % 2 !== 0;
        return (
            <motion.div 
                whileHover={{ x: isRight ? 10 : -10 }}
                onClick={handleNodeClick}
                className={`w-[260px] group ${hasChildren ? 'cursor-pointer' : ''} relative`}
            >
                <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-slate-900" />
                
                <div className="bg-slate-900 border-2 border-emerald-500 p-6 rounded-none relative shadow-[8px_8px_0_rgba(16,185,129,0.2)]">
                    {/* Detalhe de Canto Geométrico */}
                    <div className={`absolute top-0 ${isRight ? 'right-0' : 'left-0'} w-8 h-8 bg-emerald-500 flex items-center justify-center`}>
                        <MapIcon className="w-4 h-4 text-slate-900" />
                    </div>

                    <div className="flex flex-col gap-4 mt-4">
                        <h4 className="text-emerald-500 font-black text-xl uppercase tracking-tighter leading-none italic">{label}</h4>
                        <div className="h-[1px] bg-emerald-500/30 w-full" />
                        
                        <div className="flex flex-col gap-2">
                            {timeline && <span className="text-[10px] font-mono font-bold text-slate-400 uppercase underline decoration-emerald-500/50">{timeline}</span>}
                            {description && <p className="text-[11px] text-slate-300 font-medium leading-snug">{description}</p>}
                        </div>

                        {status && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase">{status}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-slate-900" />
            </motion.div>
        );
    }

    // --- 1. GRAP FRAMEWORK ---
    if (templateId === 'grap') {
        const letter = label.trim().charAt(0).toUpperCase();
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleNodeClick}
                className={`flex items-center gap-4 group relative ${hasChildren ? 'cursor-pointer' : ''}`}
            >
                <Handle type="target" position={targetPosition} className="opacity-0" />
                <div 
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shadow-lg border-4 transition-all ${
                        isRoot ? 'bg-theme-title text-theme-body' : 'bg-theme-sidebar'
                    }`}
                    style={{ 
                        borderColor: isRoot ? nodeColor : (isCollapsed ? '#f59e0b' : nodeColor),
                        color: isRoot ? undefined : nodeColor 
                    }}
                >
                    {letter}
                </div>
                <div className="bg-theme-card border border-theme-border p-4 rounded-xl shadow-2xl min-w-[180px] backdrop-blur-md group-hover:border-theme-primary/30 transition-colors">
                    <span className="text-theme-title font-bold text-sm tracking-tighter uppercase block">{label}</span>
                    {hasChildren && <div className="text-[10px] mt-1 font-bold" style={{ color: nodeColor }}>{isCollapsed ? 'Clique para Expandir +' : 'Framework Step →'}</div>}
                </div>
                <Handle type="source" position={sourcePosition} className="opacity-0" />
            </motion.div>
        );
    }

    // --- 2. BACKLINKO ---
    if (templateId === 'backlinko') {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNodeClick} className={`flex flex-col items-center relative ${hasChildren ? 'cursor-pointer' : ''}`}>
                <Handle type="target" position={targetPosition} className="!w-3 !h-3 !border-2 !border-white shadow-sm" style={{ backgroundColor: nodeColor }} />
                <div className={`w-[220px] border-2 rounded-2xl overflow-hidden shadow-2xl bg-theme-card transition-all`} style={{ borderColor: nodeColor }}>
                    <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: nodeColor }}>
                        <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-white/40" /><div className="w-2 h-2 rounded-full bg-white/40" /></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{isRoot ? 'DOMAIN' : 'HUB'}</span>
                        <Zap className={`w-3 h-3 ${isCollapsed ? 'text-orange-300' : 'text-white/50'}`} />
                    </div>
                    <div className="p-4 bg-theme-sidebar/50">
                        <div className={`p-4 rounded-xl text-center shadow-inner transition-colors ${isCollapsed ? 'bg-theme-body' : ''}`} style={{ backgroundColor: isCollapsed ? undefined : nodeColor }}>
                            <span className="text-white font-bold text-xs leading-tight block drop-shadow-md">{label}</span>
                        </div>
                    </div>
                </div>
                {childCount > 0 && (
                    <div className="mt-2 bg-theme-card border px-4 py-1 rounded-full shadow-sm" style={{ borderColor: nodeColor }}>
                        <span className="text-[10px] font-black uppercase" style={{ color: nodeColor }}>{childCount} PAGES {isCollapsed ? '(+)' : ''}</span>
                    </div>
                )}
                <Handle type="source" position={sourcePosition} className="!w-3 !h-3 !border-2 !border-white shadow-sm" style={{ backgroundColor: nodeColor }} />
            </motion.div>
        );
    }

    // --- 3. WIREFRAME ---
    if (templateId === 'wireframe') {
        return (
            <motion.div 
                className={`w-[200px] border-2 border-theme-border rounded-xl bg-theme-card overflow-hidden shadow-xl flex flex-col group relative transition-all ${hasChildren ? 'cursor-pointer' : ''}`} 
                whileHover={{ scale: 1.02 }}
                onClick={handleNodeClick}
            >
                <Handle type="target" position={targetPosition} className="!bg-theme-border" />
                <div className="h-4 text-[7px] text-white flex items-center px-3 font-black uppercase tracking-widest" style={{ backgroundColor: nodeColor }}>Structure / Header</div>
                <div className="p-4 flex flex-col gap-2">
                    <div className={`h-9 rounded-lg flex items-center justify-center text-[11px] text-white font-bold px-3 text-center leading-none shadow-sm transition-colors`} style={{ backgroundColor: isCollapsed ? '#64748b' : nodeColor }}>
                        {label} {isCollapsed ? '...' : ''}
                    </div>
                    <div className="flex gap-1.5"><div className="bg-theme-body h-2 rounded-full w-3/4" /><div className="bg-theme-body h-2 rounded-full w-1/4" /></div>
                    <div className="bg-theme-body h-3 rounded-md w-full" />
                </div>
                <div className="bg-theme-sidebar h-4 mt-auto text-[7px] text-theme-muted flex items-center px-3 uppercase font-black justify-end excerpt">Section Footer</div>
                <Handle type="source" position={sourcePosition} className="!bg-theme-border" />
            </motion.div>
        );
    }

    // --- 4. CORPORATE ORG CHART ---
    if (templateId === 'orgchart') {
        const parts = label.split('-');
        const role = parts[0].trim();
        const name = parts[1]?.trim() || '';
        return (
            <motion.div 
                onClick={handleNodeClick}
                className={`flex flex-col min-w-[180px] max-w-[240px] rounded-2xl border-2 overflow-hidden shadow-2xl transition-all relative ${hasChildren ? 'cursor-pointer' : ''}`}
                style={{ borderColor: isCollapsed ? '#f59e0b' : nodeColor }}
            >
                <Handle type="target" position={targetPosition} className="opacity-0" />
                <div className={`px-4 py-3 text-white text-center transition-colors`} style={{ backgroundColor: isCollapsed ? '#d97706' : nodeColor }}>
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em]">{role} {isCollapsed ? '(+)' : ''}</span>
                </div>
                <div className="px-4 py-3 bg-theme-card text-theme-title text-center">
                    <span className="block text-sm font-bold tracking-tight">{name || '---'}</span>
                </div>
                <Handle type="source" position={sourcePosition} className="opacity-0" />
            </motion.div>
        );
    }
    
    // --- 5. NEO-BRUTALISM ---
    if (templateId === 'neobrutalist') {
        const shadowColor = isCollapsed ? '#d97706' : 'currentColor';
        return (
            <motion.div 
                whileHover={{ scale: 1.05, x: -4, y: -4 }}
                onClick={handleNodeClick}
                className={`flex flex-col items-center justify-center p-6 border-[3px] border-theme-title transition-all ${hasChildren ? 'cursor-pointer' : ''} min-w-[160px] text-theme-title`}
                style={{ 
                    backgroundColor: nodeColor,
                    boxShadow: `8px 8px 0px 0px ${shadowColor}`,
                    borderRadius: '0px'
                }}
            >
                <Handle type="target" position={targetPosition} className="!bg-theme-title !w-3 !h-3 !rounded-none" />
                <span className="text-black font-black text-sm uppercase tracking-tighter text-center">{label}</span>
                {isCollapsed && hasChildren && <Plus className="w-4 h-4 text-black mt-2" />}
                <Handle type="source" position={sourcePosition} className="!bg-theme-title !w-3 !h-3 !rounded-none" />
            </motion.div>
        );
    }

    // --- 6. GLASSMORPHISM ---
    if (templateId === 'glass') {
        return (
            <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={handleNodeClick}
                className={`p-6 rounded-[2rem] border border-white/20 backdrop-blur-xl shadow-2xl relative overflow-hidden group ${hasChildren ? 'cursor-pointer' : ''} min-w-[180px]`}
                style={{ 
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                }}
            >
                <Handle type="target" position={targetPosition} className="!bg-white/40 !border-white/20" />
                <div 
                    className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30" 
                    style={{ backgroundColor: nodeColor }} 
                />
                <div className="relative z-10 flex flex-col items-center gap-2">
                    <span className="text-white font-medium tracking-tight text-center leading-tight">{label}</span>
                    <div className="w-8 h-1 rounded-full opacity-50" style={{ backgroundColor: nodeColor }} />
                    {isCollapsed && hasChildren && <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">Expansion +</div>}
                </div>
                <Handle type="source" position={sourcePosition} className="!bg-white/40 !border-white/20" />
            </motion.div>
        );
    }

    // --- 7. CYBERPUNK NEON ---
    if (templateId === 'cyberpunk') {
        return (
            <motion.div 
                whileHover={{ scale: 1.05, filter: 'hue-rotate(15deg)' }}
                onClick={handleNodeClick}
                className={`p-5 bg-black border-2 relative overflow-hidden group ${hasChildren ? 'cursor-pointer' : ''} min-w-[190px]`}
                style={{ 
                    borderColor: nodeColor,
                    boxShadow: `0 0 15px ${nodeColor}, inset 0 0 10px ${nodeColor}44`,
                    clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)'
                }}
            >
                <Handle type="target" position={targetPosition} className="!bg-pink-500 !border-none !w-2 !h-2" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:10px_10px]" />
                <div className="relative z-10">
                    <div className="text-[10px] font-black text-pink-500 mb-1 tracking-[0.3em] uppercase italic opacity-80 flex justify-between">
                        <span>SYS_ID_{id.slice(-4)}</span>
                        {isCollapsed && <span>[+]</span>}
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide block drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                        {label}
                    </span>
                    <div className="h-[2px] w-full mt-2 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />
                </div>
                <Handle type="source" position={sourcePosition} className="!bg-pink-500 !border-none !w-2 !h-2" />
            </motion.div>
        );
    }

    // --- 8. SKETCH / HAND-DRAWN ---
    if (templateId === 'sketch') {
        return (
            <motion.div 
                whileHover={{ rotate: 1 }}
                onClick={handleNodeClick}
                className={`p-6 bg-theme-card border-[2.5px] border-theme-title shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] relative group ${hasChildren ? 'cursor-pointer' : ''} min-w-[170px]`}
                style={{ 
                    borderRadius: '45% 55% 50% 50% / 5% 5% 95% 95%',
                    borderColor: nodeColor
                }}
            >
                <Handle type="target" position={targetPosition} className="!bg-theme-title" />
                <span className="text-theme-title font-medium text-lg leading-tight block text-center" style={{ fontFamily: 'Syne, cursive' }}>
                    {label}
                </span>
                {isCollapsed && hasChildren && <div className="text-xs text-center mt-2 opacity-60 font-bold underline text-theme-muted">ver mais</div>}
                <Handle type="source" position={sourcePosition} className="!bg-theme-title" />
            </motion.div>
        );
    }

    // --- 9. HOLOGRAM ---
    if (templateId === 'hologram') {
        return (
            <motion.div 
                whileHover={{ scale: 1.05 }}
                animate={{ 
                    background: [
                        'linear-gradient(rgba(6,182,212,0.1), rgba(6,182,212,0.05))',
                        'linear-gradient(rgba(6,182,212,0.15), rgba(6,182,212,0.1))',
                        'linear-gradient(rgba(6,182,212,0.1), rgba(6,182,212,0.05))'
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                onClick={handleNodeClick}
                className={`p-6 border-x-2 border-t border-b-0 backdrop-blur-sm relative group overflow-hidden ${hasChildren ? 'cursor-pointer' : ''} min-w-[180px]`}
                style={{ 
                    borderColor: `${nodeColor}aa`,
                    boxShadow: `0 -10px 20px -5px ${nodeColor}33`,
                }}
            >
                <Handle type="target" position={targetPosition} className="!bg-cyan-400 !border-none" />
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-transparent via-cyan-400/10 to-transparent -translate-y-full hover:animate-[shimmer_2s_infinite]" />
                
                <div className="relative z-10 text-center">
                    <span className="text-cyan-400 font-light text-xs tracking-[0.2em] uppercase block mb-1 opacity-60">Digital Construct</span>
                    <span className="text-white font-black text-sm tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                        {label}
                    </span>
                    {isCollapsed && hasChildren && (
                        <div className="mt-2 text-[8px] text-cyan-300 font-mono tracking-widest animate-pulse">
                            &gt;&gt; STREAMING_DATA
                        </div>
                    )}
                </div>
                <Handle type="source" position={sourcePosition} className="!bg-cyan-400 !border-none" />
            </motion.div>
        );
    }

    // --- 10. SWISS / MINIMALIST ---
    if (templateId === 'swiss') {
        return (
            <motion.div 
                whileHover={{ x: 5 }}
                onClick={handleNodeClick}
                className={`flex flex-col border-l-[8px] bg-theme-card group ${hasChildren ? 'cursor-pointer' : ''} min-w-[200px] shadow-sm`}
                style={{ borderColor: nodeColor }}
            >
                <Handle type="target" position={targetPosition} className="!bg-theme-title !border-none !rounded-none" />
                <div className="p-4 border-b border-theme-border flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-tighter text-theme-muted">Index_{id.slice(0,2)}</span>
                    <span className="text-[9px] font-bold text-theme-primary">CH_0{depth}</span>
                </div>
                <div className="p-6">
                    <span className="text-theme-title font-black text-2xl tracking-tighter leading-none block uppercase break-words">
                        {label}
                    </span>
                </div>
                <div className="px-4 py-2 bg-theme-sidebar flex justify-between items-center">
                    <div className="flex gap-1"><div className="w-1 h-1 bg-theme-title" /><div className="w-1 h-1 bg-theme-title" /></div>
                    {isCollapsed && hasChildren && <span className="text-[10px] font-black italic">+ OPEN</span>}
                </div>
                <Handle type="source" position={sourcePosition} className="!bg-theme-title !border-none !rounded-none" />
            </motion.div>
        );
    }

    // --- 11. RETRO 8-BIT / TERMINAL ---
    if (templateId === 'retro') {
        return (
            <motion.div 
                whileHover={{ y: -2 }}
                onClick={handleNodeClick}
                className={`p-4 bg-[#0a0a0a] border-4 border-double font-mono group ${hasChildren ? 'cursor-pointer' : ''} min-w-[180px]`}
                style={{ 
                    borderColor: nodeColor,
                    boxShadow: `4px 4px 0px 0px ${nodeColor}66`
                }}
            >
                <Handle type="target" position={targetPosition} className="!bg-green-500 !border-none !rounded-none" />
                <div className="flex items-center gap-2 mb-3 border-b border-green-900 pb-1">
                    <div className="w-2 h-2 bg-green-500 animate-[pulse_1s_infinite]" />
                    <span className="text-[8px] text-green-700 uppercase tracking-widest">A:\PROMPT&gt;</span>
                </div>
                <span className="text-green-500 font-bold text-sm tracking-widest block uppercase">
                    {isCollapsed ? `[+] ${label}` : `> ${label}_`}
                </span>
                <div className="mt-4 flex justify-between">
                    <div className="flex gap-1"><div className="w-1 h-1 bg-green-900" /><div className="w-1 h-1 bg-green-900" /></div>
                    <span className="text-[7px] text-green-900 font-black">CRT_MODE_ON</span>
                </div>
                <Handle type="source" position={sourcePosition} className="!bg-green-500 !border-none !rounded-none" />
            </motion.div>
        );
    }

    // --- 12. MINDMAP & SITEMAP (DEFAULT) ---
    let styles = "rounded-2xl px-6 py-4 shadow-2xl border-2";
    let bg = "";
    let text = "text-white";
    let dynamicStyle: any = { backgroundColor: nodeColor, borderColor: nodeColor };

    if (templateId === 'mindmap' && depth === 0) {
        bg = "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 scale-110";
        dynamicStyle = { borderColor: nodeColor };
    } else if (isCollapsed && hasChildren) {
        bg = "bg-theme-sidebar border-dashed";
        text = "text-theme-muted italic";
        dynamicStyle = { borderColor: nodeColor, color: nodeColor };
    } else {
        // Para sitemaps normais, garantir que o texto seja legível
        // Se a cor do node for muito clara, o texto branco some no tema claro
        text = "text-white drop-shadow-md font-bold";
    }

    return (
        <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={handleNodeClick}
            className={`${styles} ${bg} ${text} ${hasChildren ? 'cursor-pointer' : ''} min-w-[140px] text-center transition-all`}
            style={dynamicStyle}
        >
            <Handle type="target" position={targetPosition} className="!bg-white/50 !border-white/20" />
            <div className="flex flex-col gap-1">
                <span className="block text-sm tracking-tight">{label} {isCollapsed ? '(+)' : ''}</span>
                {description && (
                    <span className="block text-[10px] text-white/70 font-medium leading-tight max-w-[180px] mx-auto">
                        {description}
                    </span>
                )}
            </div>
            <Handle type="source" position={sourcePosition} className="!bg-white/50 !border-white/20" />
        </motion.div>
    );
};



export default CustomSitemapNode;
