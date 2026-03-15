import React, { useState, useEffect } from 'react';
import { Star, Trophy, Globe, Lock, ShieldCheck, Zap, Loader2, AlertCircle, Database, Search } from 'lucide-react';
import { CatalogStatusResponse, ApiKeyStatus, modelCatalogApi } from '../../../../shared/services/api';
interface ApiKey {
    id: string;
    service: string;
    key: string;
    isActive: boolean;
    status?: ApiKeyStatus | null;
    checkingStatus?: boolean;
}

interface ModelsTabProps {
    apiKeys: ApiKey[];
    catalogStatus: CatalogStatusResponse | null;
    userPrefs: any;
    onSyncCatalog: () => Promise<void>;
}

export const ModelsTab = ({
    apiKeys,
    catalogStatus,
    userPrefs,
    catalogModels: propModels = [],
    onSyncCatalog
}: ModelsTabProps & { catalogModels?: any[] }) => {
    const [selectedActivity, setSelectedActivity] = useState<string>('all');
    const [filterByPrefs, setFilterByPrefs] = useState<boolean>(false);
    const [catalogModels, setCatalogModels] = useState<any[]>(propModels);
    const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);
    const [hasLoadedInternal, setHasLoadedInternal] = useState<boolean>(false);

    useEffect(() => {
        // Se já recebeu modelos via props, não precisa buscar internamente
        if (propModels && propModels.length > 0) {
            setCatalogModels(propModels);
            setLoadingCatalog(false);
            return;
        }

        // Caso contrário, busca uma vez se ainda não carregou
        const loadCatalog = async () => {
            if (hasLoadedInternal) return;
            try {
                setLoadingCatalog(true);
                const res = await modelCatalogApi.listModels();
                setCatalogModels(res.models || []);
                setHasLoadedInternal(true);
            } catch (err) {
                console.error("Erro ao carregar catálogo:", err);
            } finally {
                setLoadingCatalog(false);
            }
        };
        loadCatalog();
    }, [propModels, hasLoadedInternal]);

    const categoryLabels: { [key: string]: string } = {
        'text': '📝 Escrita (Geral)',
        'reasoning': '🧠 Raciocínio (o1/R1)',
        'audio': '🎵 Áudio',
        'image': '🖼️ Imagem (Geração)',
        'video': '🎬 Vídeo',
        'code': '💻 Código',
        'multimodal': '🌐 Multimodal (Vision)',
        'long_context': '📚 Longo Contexto (1M+)',
        'translation': '🔤 Tradução',
        'creative': '✍️ Criativo',
        'structured': '📊 Dados Estruturados',
        'small_model': '⚡ Baixa Latência'
    };

    const categoryOrder = [
        'multimodal', 'reasoning', 'code', 'long_context',
        'text', 'image', 'video', 'audio',
        'translation', 'creative', 'structured', 'small_model'
    ];

    const getFilteredModels = () => {
        // Mapeia modelos ativos por nome para busca rápida
        const activeModelsMap: { [key: string]: any } = {};
        apiKeys.forEach(key => {
            if (key.status && key.status.models_status) {
                key.status.models_status.forEach((m: any) => {
                    const name = m.name.toLowerCase();
                    if (!activeModelsMap[name]) {
                        activeModelsMap[name] = m;
                    }
                });
            }
        });

        // Constrói a lista final baseada no CATÁLOGO COMPLETO
        let finalModels = catalogModels.map((catMode: any) => {
            const activeModel = activeModelsMap[catMode.display_name.toLowerCase()] ||
                activeModelsMap[catMode.id.toLowerCase()];

            return {
                ...catMode,
                name: catMode.display_name,
                available: activeModel?.available || false,
                blocked: activeModel?.blocked || false,
                status: activeModel?.status || 'not_configured',
                tier: activeModel?.tier || catMode.tier || 'unknown',
                // Preserva preços se o modelo estiver ativo
                input_price: activeModel?.input_price || 0,
                output_price: activeModel?.output_price || 0,
                // Prioriza notas do catálogo
                elo_rating: catMode.elo_rating || activeModel?.elo_rating,
                performance_score: catMode.performance_score,
                win_rate: catMode.win_rate,
                total_votes: catMode.total_votes,
                organization: catMode.organization,
                capabilities: catMode.capabilities || []
            };
        });

        // Se não houver catálogo ainda (vazio), usa apenas os modelos ativos como fallback
        if (finalModels.length === 0) {
            finalModels = Object.values(activeModelsMap);
        }

        // 1. Filtro por Atividade (selectedActivity)
        let filteredModels = finalModels;
        if (selectedActivity !== 'all') {
            filteredModels = filteredModels.filter((m: any) => {
                const cat = m.category || 'text';
                return cat === selectedActivity || (selectedActivity === 'text' && !m.category);
            });
        }

        // 2. Filtro por Preferências (filterByPrefs)
        if (filterByPrefs && userPrefs) {
            const mode = userPrefs.usage_mode || 'free';
            if (mode === 'free') {
                filteredModels = filteredModels.filter((m: any) => m.tier === 'free');
            } else {
                const strategyKey = `${selectedActivity === 'all' ? 'global' : selectedActivity}_strategy`;
                const strategy = userPrefs[strategyKey] || userPrefs.global_strategy || 'performance';
                if (strategy === 'free') {
                    filteredModels = filteredModels.filter((m: any) => m.tier === 'free');
                }
            }
        }

        return filteredModels;
    };

    // Calcula categorias e contagem de modelos para os filtros
    const getCategoryCounts = () => {
        const models = getFilteredModels(); // Pega a lista completa atual
        const counts: { [key: string]: number } = { all: models.length };
        models.forEach((m: any) => {
            const cat = m.category || 'text';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        return counts;
    };

    const categoryCounts = getCategoryCounts();
    const availableCategories = categoryOrder.filter(c => (categoryCounts[c] || 0) > 0);

    const renderModelList = () => {
        const filteredModels = getFilteredModels();

        // Agrupa por categoria
        const grouped: { [key: string]: any[] } = {};
        filteredModels.forEach((model: any) => {
            const cat = model.category || 'text';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(model);
        });

        return categoryOrder.map(category => {
            const models = grouped[category];
            if (!models || models.length === 0) return null;

            return (
                <div key={category} className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 border-b border-theme-border pb-4 mb-6">
                        <div className="text-xl font-black text-theme-title tracking-tight">
                            {categoryLabels[category] || category}
                        </div>
                        <span className="px-2 py-0.5 bg-theme-primary/10 text-theme-primary text-[10px] font-black rounded-full">
                            {models.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                        {models.map((model: any, idx: number) => (
                            <div key={`${model.name}-${idx}`}
                                className={`group p-6 rounded-3xl bg-theme-card/40 border border-theme-border/50 hover:border-theme-primary/30 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden shadow-theme`}
                            >
                                <div className="flex justify-between items-start gap-4 z-10">
                                    <div className="flex-1">
                                        <div className="font-bold text-theme-title text-sm leading-tight mb-1 group-hover:text-theme-primary transition-colors">
                                            {model.organization ? `${model.organization}: ` : ''}{model.name}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end shrink-0">
                                        {model.elo_rating && (
                                            <div className="flex items-center gap-1 bg-amber-500/5 px-2 py-0.5 rounded-md text-amber-500/80 text-[9px] font-black border border-amber-500/10" title="Chatbot Arena Elo Rating">
                                                <Trophy className="w-2.5 h-2.5" />
                                                {Math.round(model.elo_rating)}
                                            </div>
                                        )}
                                        {model.performance_score && (
                                            <div className="flex items-center gap-1 bg-blue-500/5 px-2 py-0.5 rounded-md text-blue-500/80 text-[9px] font-black border border-blue-500/10" title="Hugging Face Open LLM Score">
                                                <Globe className="w-2.5 h-2.5" />
                                                {model.performance_score.toFixed(1)}%
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 z-10">
                                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 border ${model.available
                                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30'
                                        }`}>
                                        {model.available ? '✅ Disponível' : '❌ Off-line'}
                                    </div>
                                    {model.tier === 'free' ? (
                                        <div className="bg-emerald-500/15 text-emerald-500 text-[10px] font-black px-2.5 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                                            <Zap className="w-3 h-3" /> GRÁTIS
                                        </div>
                                    ) : null}
                                </div>

                                {model.available && (
                                    <div className="mt-auto z-10">
                                        {model.tier === 'free' ? (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/80">
                                                <Database className="w-3 h-3" />
                                                <span>Créditos</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4 text-[10px] text-zinc-400/80 font-medium">
                                                <span>In: <strong className="text-zinc-200">${((model.input_price || 0) * 1000000).toFixed(2)}</strong> / 1M</span>
                                                <span>Out: <strong className="text-zinc-200">${((model.output_price || 0) * 1000000).toFixed(2)}</strong> / 1M</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-[7px] font-bold text-theme-muted uppercase tracking-widest mt-2 pt-2 border-t border-theme-border/30 z-10 opacity-30">
                                    <span>{model.license_type || 'Licença Proprietária'}</span>
                                    <span>Via: Chaves Ativas</span>
                                </div>

                                <Database className="absolute -right-4 -bottom-4 w-16 h-16 text-theme-primary/5 -rotate-12 pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="space-y-8">
            {/* Filtros de Visualização */}
            <div className="bg-theme-card border border-theme-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 flex-1">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] ml-2">Explorar por Categoria</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedActivity('all')}
                                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${selectedActivity === 'all'
                                    ? 'bg-theme-primary text-white border-theme-primary shadow-lg scale-105'
                                    : 'bg-theme-secondary/5 border-theme-border text-theme-muted hover:border-theme-primary/50'
                                    }`}
                            >
                                Todos ({categoryCounts.all})
                            </button>
                            {availableCategories.map(activity => (
                                <button
                                    key={activity}
                                    onClick={() => setSelectedActivity(activity)}
                                    className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${selectedActivity === activity
                                        ? 'bg-theme-primary text-white border-theme-primary shadow-lg scale-105'
                                        : 'bg-theme-secondary/5 border-theme-border text-theme-muted hover:border-theme-primary/50'
                                        }`}
                                >
                                    {(categoryLabels[activity] || activity).split(' (')[0]} ({categoryCounts[activity] || 0})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] text-right hidden md:block">Preferências</label>
                        <button
                            onClick={() => setFilterByPrefs(!filterByPrefs)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${filterByPrefs
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 shadow-inner'
                                : 'bg-theme-secondary/5 border-theme-border text-theme-muted hover:bg-theme-secondary/10'
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 ${filterByPrefs ? 'bg-amber-500 border-amber-600' : 'border-theme-border'}`} />
                            Filtrar por minhas preferências
                        </button>
                    </div>
                </div>
                <Search className="absolute -left-10 -top-10 w-40 h-40 text-theme-primary/5 rotate-12 pointer-events-none" />
            </div>

            {/* Notificação sobre status do catálogo */}
            {catalogStatus && (!catalogStatus.api_available || catalogStatus.using_mock_data || catalogStatus.api_error) && (
                <div className="bg-amber-500/5 border border-amber-200/50 p-6 rounded-[2rem] flex items-center gap-6 animate-pulse">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-amber-700 text-xs uppercase tracking-widest mb-1">Catálogo em Modo Limitado</h4>
                        <p className="text-[11px] text-amber-900/60 font-medium">
                            {catalogStatus.using_mock_data
                                ? 'API externa indisponível. Exibindo dados de cache local otimizados.'
                                : catalogStatus.api_error || 'Sincronização pendente.'}
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                await onSyncCatalog();
                            } catch (error) {
                                console.error(error);
                            }
                        }}
                        className="px-6 py-3 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
                    >
                        Sincronizar Agora
                    </button>
                </div>
            )}

            {/* Grid de Modelos */}
            {loadingCatalog && catalogModels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-theme-primary animate-spin" />
                    <p className="font-black text-theme-muted text-[10px] uppercase tracking-[0.3em]">Mapeando Arquitetura do Catálogo...</p>
                </div>
            ) : (
                <div>
                    {renderModelList()}
                </div>
            )}
        </div>
    );
};
