import React, { useState, useEffect } from 'react';

const STRATEGIES = [
    { value: 'performance', label: 'Alto Desempenho (Melhores Modelos)' },
    { value: 'cost_benefit', label: 'Custo-Benefício (Equilíbrio)' },
    { value: 'speed', label: 'Velocidade (Respostas Rápidas)' },
    { value: 'cheapest', label: 'Mais Barato (Economia)' },
    { value: 'free', label: 'Gratuito (Somente Free Tier)' }
];

export const ModelPreferences = ({ userProfile: initialProfile }: { userProfile?: any }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        usage_mode: 'free',
        global_strategy: 'performance',
        chat_strategy: 'global',
        code_strategy: 'global',
        vision_strategy: 'global',
        video_strategy: 'global',
        multimodal_strategy: 'global',
        translation_strategy: 'global',
        reasoning_strategy: 'global',
        long_context_strategy: 'global',
        audio_strategy: 'global',
        creative_strategy: 'global',
        structured_strategy: 'global',
        small_model_strategy: 'global'
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = () => {
        setLoading(true);
        try {
            // Tenta carregar do localStorage primeiro, depois do prop, depois default
            const saved = localStorage.getItem('sarak_model_preferences');
            if (saved) {
                setPreferences(JSON.parse(saved));
            } else if (initialProfile?.model_preferences) {
                setPreferences({ ...preferences, ...initialProfile.model_preferences });
            }
        } catch (error) {
            console.error('Erro ao carregar preferências locais:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            localStorage.setItem('sarak_model_preferences', JSON.stringify(preferences));
            setMessage({ type: 'success', text: 'Preferências salvas localmente com sucesso!' });
        } catch (error) {
            console.error('Erro ao salvar localmente:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar preferências.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Carregando preferências...</div>;

    const CategorySelector = ({ label, value, onChange, disabled, icon }: any) => (
        <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3 ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'bg-theme-card/40 border-theme-border/50 hover:border-theme-primary/30 shadow-sm'
            }`}>
            <label className="flex items-center gap-2.5 font-bold text-theme-title text-[11px] uppercase tracking-wider">
                <span className="text-base">{icon}</span> {label}
            </label>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full bg-theme-body/50 border border-theme-border p-3 rounded-xl focus:border-theme-primary outline-none transition-all text-theme-title font-medium text-xs cursor-pointer appearance-none"
            >
                <option value="global">Seguir Global</option>
                {STRATEGIES.map(s => (
                    <option key={s.value} value={s.value}>{s.label.split(' (')[0]}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl space-y-10">
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-theme-title tracking-tight flex items-center gap-3">
                    Inteligência do sistema
                </h3>
                <p className="text-theme-muted text-sm max-w-2xl leading-relaxed">
                    Configure como o sistema deve escolher automaticamente os modelos de IA para cada tipo de tarefa.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {/* 1. Master Toggle: Modo de Uso */}
                <div className="p-8 border border-theme-border/50 rounded-3xl bg-theme-card/30 shadow-theme backdrop-blur-sm relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="space-y-2">
                            <label className="block text-xl font-black text-theme-title tracking-tight">
                                Modo de Uso
                            </label>
                            <p className="text-theme-muted text-xs font-medium max-w-md">
                                {preferences.usage_mode === 'free'
                                    ? 'Focado em economia extrema. O sistema utilizará apenas modelos gratuitos (Free Tier).'
                                    : 'Acesso total. Permite configurar cada agente com os melhores modelos profissionais disponíveis.'}
                            </p>
                        </div>
                        <div className="flex bg-theme-secondary/10 p-1.5 rounded-2xl border border-theme-border/50 shadow-inner">
                            <button
                                onClick={() => setPreferences({ ...preferences, usage_mode: 'free' })}
                                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all cursor-pointer ${preferences.usage_mode === 'free'
                                    ? 'bg-theme-card text-emerald-500 shadow-lg border border-theme-border/50 scale-105'
                                    : 'text-theme-muted hover:text-theme-title'
                                    }`}
                            >
                                Total Grátis
                            </button>
                            <button
                                onClick={() => setPreferences({ ...preferences, usage_mode: 'paid' })}
                                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all cursor-pointer ${preferences.usage_mode === 'paid'
                                    ? 'bg-theme-card text-theme-primary shadow-lg border border-theme-border/50 scale-105'
                                    : 'text-theme-muted hover:text-theme-title'
                                    }`}
                            >
                                Personalizado
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Estratégia Global (Base) */}
                <div className={`p-8 border transition-all duration-500 rounded-3xl bg-theme-card/30 ${preferences.usage_mode === 'free' ? 'opacity-40 grayscale pointer-events-none' : 'border-theme-border shadow-theme'
                    }`}>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 text-xs font-black text-theme-title uppercase tracking-widest">
                            <span className="p-2 bg-theme-primary/10 rounded-lg text-theme-primary">⚡</span>
                            Estratégia Global (Master)
                        </label>
                        <div className="relative group">
                            <select
                                value={preferences.global_strategy}
                                onChange={(e) => setPreferences({ ...preferences, global_strategy: e.target.value })}
                                disabled={preferences.usage_mode === 'free'}
                                className="w-full bg-theme-body/50 border border-theme-border p-5 rounded-2xl focus:border-theme-primary outline-none transition-all text-theme-title font-bold text-sm cursor-pointer appearance-none shadow-inner"
                            >
                                {STRATEGIES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                                🔽
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Estratégias por Agente */}
                <div className={`p-8 border transition-all duration-500 rounded-3xl bg-theme-card/30 border-theme-border shadow-theme ${preferences.usage_mode === 'free' ? 'opacity-40 grayscale pointer-events-none' : ''
                    }`}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-theme-primary/10 rounded-2xl text-theme-primary">
                            <span className="text-xl">🤖</span>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-theme-title tracking-tight">Modelos Especializados</h4>
                            <p className="text-theme-muted text-[10px] font-bold uppercase tracking-widest">Ajuste fino de inteligência por tarefa</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
                        <CategorySelector
                            icon="💬" label="Chat (Texto)"
                            value={preferences.chat_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, chat_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="💻" label="Código"
                            value={preferences.code_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, code_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="🖼️" label="Visão"
                            value={preferences.vision_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, vision_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="🎬" label="Vídeo"
                            value={preferences.video_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, video_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="🌐" label="Multimodal"
                            value={preferences.multimodal_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, multimodal_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="🔤" label="Tradução"
                            value={preferences.translation_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, translation_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="🧠" label="Raciocínio Lógico"
                            value={preferences.reasoning_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, reasoning_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="📚" label="Longo Contexto"
                            value={preferences.long_context_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, long_context_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="🎤" label="Áudio Nativo"
                            value={preferences.audio_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, audio_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="✍️" label="Escrita Criativa"
                            value={preferences.creative_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, creative_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="📊" label="Dados Estruturados"
                            value={preferences.structured_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, structured_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                        <CategorySelector
                            icon="⚡" label="Baixa Latência"
                            value={preferences.small_model_strategy}
                            onChange={(e: any) => setPreferences({ ...preferences, small_model_strategy: e.target.value })}
                            disabled={preferences.usage_mode === 'free'}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-theme-primary/5 rounded-[2rem] border border-theme-primary/20">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-theme-primary animate-pulse shadow-[0_0_10px_var(--primary-color)]" />
                    <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em]">O sistema adapta os modelos em tempo real</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-12 py-5 bg-theme-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-theme-primary/30 flex items-center gap-3 cursor-pointer ${saving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {saving ? 'PROCESSANDO...' : 'SALVAR PREFERÊNCIAS'}
                </button>
            </div>

            {message.text && (
                <div className={`p-6 rounded-2xl border flex items-center gap-4 ${message.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                    <span className="text-xl">{message.type === 'error' ? '❌' : '✅'}</span>
                    <span className="font-bold text-sm">{message.text}</span>
                </div>
            )}
        </div>
    );
};

