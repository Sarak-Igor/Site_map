import React, { useState, useEffect } from 'react';
import { Key, Activity, RefreshCw, Plus, CheckCircle2, AlertCircle, Info, ExternalLink, BarChart3, Database, Calculator, Brain, Trash2 } from 'lucide-react';
import { apiKeysApi, ApiKeyStatus, usageApi, UsageStatsResponse, modelCatalogApi, CatalogStatusResponse, authApi } from '../../shared/services/api';
import ExpandableCard from '../../core/components/ExpandableCard';
import { ModelsTab } from './components/ModelsTab/ModelsTab';
import { ModelPreferences } from './components/ModelPreferences/ModelPreferences';

const SERVICES = [
    { id: 'gemini', name: 'Google Gemini', url: 'https://aistudio.google.com/apikey' },
    { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/keys' },
    { id: 'groq', name: 'Groq', url: 'https://console.groq.com/keys' },
    { id: 'deepseek', name: 'DeepSeek', url: 'https://platform.deepseek.com/api_keys' },
    { id: 'together', name: 'Together AI', url: 'https://api.together.xyz/settings/api-keys' },
    { id: 'openai', name: 'OpenAI', url: 'https://platform.openai.com/api-keys' },
    { id: 'anthropic', name: 'Anthropic', url: 'https://console.anthropic.com/settings/keys' },
    { id: 'mistral', name: 'Mistral AI', url: 'https://console.mistral.ai/api-keys/' },
    { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/settings/api' },
    { id: 'xai', name: 'X.AI (Grok)', url: 'https://console.x.ai/' },
];

const ApiKeysPage: React.FC = () => {
    const [keys, setKeys] = useState<any[]>([]);
    const [usage, setUsage] = useState<UsageStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [selectedService, setSelectedService] = useState('gemini');
    const [newKey, setNewKey] = useState('');
    const [activeTab, setActiveTab] = useState<'usage' | 'providers' | 'catalog' | 'preferences'>('usage');
    const [catalogStatus, setCatalogStatus] = useState<CatalogStatusResponse | null>(null);
    const [models, setModels] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [userPrefs, setUserPrefs] = useState<any>({});
    const [customServiceName, setCustomServiceName] = useState('');
    const [isCustomService, setIsCustomService] = useState(false);
    const [verifying, setVerifying] = useState<Record<string, boolean>>({});
    const [validationError, setValidationError] = useState<Record<string, string | null>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [keysRes, usageRes, catalogStatusRes, profileRes, modelsRes] = await Promise.all([
                apiKeysApi.list(),
                usageApi.getStats(),
                modelCatalogApi.getStatus(),
                authApi.getProfile(),
                modelCatalogApi.listModels()
            ]);

            const loadedKeys = keysRes.api_keys.map((k: any) => ({
                ...k,
                status: null,
                checkingStatus: false
            }));

            setKeys(loadedKeys);
            setUsage(usageRes);
            setCatalogStatus(catalogStatusRes);
            setProfile(profileRes);
            setModels(modelsRes.models || []);
            setUserPrefs(profileRes.model_preferences || {});

            // Verificação automática de status para todas as chaves carregadas
            if (loadedKeys.length > 0) {
                loadedKeys.forEach((key: any) => {
                    checkApiKeyStatus(key);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dados LLM:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkApiKeyStatus = async (apiKey: any) => {
        setKeys(prevKeys => prevKeys.map(k =>
            k.service === apiKey.service ? { ...k, checkingStatus: true } : k
        ));

        try {
            const status = await apiKeysApi.checkSavedStatus(apiKey.service);
            setKeys(prevKeys => prevKeys.map(k =>
                k.service === apiKey.service ? { ...k, status, checkingStatus: false } : k
            ));
        } catch (error: any) {
            console.error(`Erro ao verificar status (${apiKey.service}):`, error);
            const errorStatus: ApiKeyStatus = {
                service: apiKey.service,
                is_valid: false,
                models_status: [],
                available_models: [],
                blocked_models: [],
                error: error.response?.data?.detail || 'Erro ao verificar status'
            };
            setKeys(prevKeys => prevKeys.map(k =>
                k.service === apiKey.service ? { ...k, status: errorStatus, checkingStatus: false } : k
            ));
        }
    };

    const handleAddKey = async (e: React.FormEvent, serviceId = null, keyToSave = null) => {
        if (e && e.preventDefault) e.preventDefault();
        const finalServiceId = serviceId || selectedService;
        const finalKeyToSave = keyToSave || newKey;

        if (!finalKeyToSave.trim()) return;

        setVerifying(prev => ({ ...prev, [finalServiceId]: true }));
        setValidationError(prev => ({ ...prev, [finalServiceId]: null }));

        try {
            await apiKeysApi.create({ service: finalServiceId, api_key: finalKeyToSave.trim() });
            setNewKey('');
            setIsAddingMode(false);
            loadData();
        } catch (error: any) {
            console.error('Erro ao salvar chave:', error);
            setValidationError(prev => ({ ...prev, [finalServiceId]: error.response?.data?.detail || 'Erro ao salvar' }));
        } finally {
            setVerifying(prev => ({ ...prev, [finalServiceId]: false }));
        }
    };

    const handleDeleteKey = async (service: string) => {
        if (!confirm(`Deseja remover a chave do provedor ${service}?`)) return;
        try {
            await apiKeysApi.delete(`service/${service}`);
            loadData();
        } catch (error) {
            console.error('Erro ao deletar chave:', error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-theme-card/50 p-8 rounded-3xl border border-theme-border backdrop-blur-sm shadow-theme">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-theme-title tracking-tight flex items-center gap-3">
                        <Key className="w-10 h-10 text-theme-primary" />
                        Dashboard LLM
                    </h1>
                    <p className="text-theme-muted text-lg max-w-xl">
                        Mensure o desempenho dos seus modelos e configure seus provedores de inteligência.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="p-4 bg-theme-secondary/10 text-theme-title rounded-2xl hover:bg-theme-secondary/20 transition-all cursor-pointer"
                        title="Sincronizar Dados"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsAddingMode(true)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-theme-primary text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-theme-primary/20 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        Configurar Provedor
                    </button>
                </div>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex p-1 bg-theme-secondary/5 rounded-2xl w-fit border border-theme-border/50">
                {[
                    { id: 'usage', label: 'Uso & Gastos', icon: BarChart3 },
                    { id: 'providers', label: 'Provedores', icon: Key },
                    { id: 'catalog', label: 'Catálogo', icon: Database },
                    { id: 'preferences', label: 'Inteligência', icon: Brain },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === tab.id
                                ? 'bg-theme-card text-theme-primary shadow-sm border border-theme-border/50'
                                : 'text-theme-muted hover:text-theme-title'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            <div>
                {activeTab === 'usage' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <ExpandableCard
                                title="Consumo Total"
                                iconContent={<Activity className="w-4 h-4" />}
                                helpButton={null}
                            >
                                <div className="space-y-6">
                                    <div className="text-center py-6">
                                        <div className="text-4xl font-black text-theme-title tracking-tighter">
                                            {(usage?.total_tokens || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mt-1">Tokens Totais (30d)</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-theme-body p-4 rounded-2xl border border-theme-border text-center">
                                            <div className="text-[9px] font-bold text-theme-muted uppercase mb-1">Input</div>
                                            <div className="font-bold text-theme-title">{(usage?.input_tokens || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-theme-body p-4 rounded-2xl border border-theme-border text-center">
                                            <div className="text-[9px] font-bold text-theme-muted uppercase mb-1">Output</div>
                                            <div className="font-bold text-theme-primary">{(usage?.output_tokens || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </ExpandableCard>

                            <ExpandableCard
                                title="Simulação de Gastos"
                                iconContent={<Calculator className="w-4 h-4" />}
                                helpButton={null}
                            >
                                <div className="space-y-6">
                                    <div className="text-center py-6">
                                        <div className="text-4xl font-black text-theme-title tracking-tighter text-green-500">
                                            $ {((usage?.total_tokens || 0) * 0.0000015).toFixed(4)}
                                        </div>
                                        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mt-1">Estimativa de Custo (USD)</div>
                                    </div>
                                    <div className="p-4 bg-theme-secondary/5 rounded-2xl border border-theme-border text-[10px] text-theme-muted leading-relaxed italic text-center">
                                        Baseado em uma média ponderada de $1.50 por milhão de tokens.
                                    </div>
                                </div>
                            </ExpandableCard>

                            <div className="lg:col-span-2 bg-theme-card/30 border border-theme-border rounded-3xl p-8 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-theme-primary/10 text-theme-primary rounded-2xl">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-theme-title">Tendência de Uso</h3>
                                        <p className="text-theme-muted text-xs">Atividade das últimas 24 horas</p>
                                    </div>
                                </div>
                                <div className="h-24 flex items-end gap-1.5 px-2">
                                    {[30, 45, 60, 25, 80, 45, 90, 65, 40, 55, 75, 50, 65, 40].map((h, i) => (
                                        <div
                                            key={i}
                                            className="grow bg-theme-primary/20 rounded-t-lg hover:bg-theme-primary transition-all group relative"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-theme-card border border-theme-border px-2 py-1 rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                +{h}k tokens
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <ExpandableCard title="Uso por Modelo" iconContent={<Activity className="w-4 h-4" />} helpButton={null}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-theme-border/50">
                                            <th className="py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">Modelo</th>
                                            <th className="py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest text-right">Tokens</th>
                                            <th className="py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest text-right">Requisições</th>
                                            <th className="py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest text-right">Custo Est.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme-border/30">
                                        {(usage?.models || []).map((m: any) => (
                                            <tr key={m.model} className="hover:bg-theme-secondary/5 transition-colors group">
                                                <td className="py-4 font-bold text-theme-title text-sm">{m.model}</td>
                                                <td className="py-4 text-right font-medium text-theme-title text-sm">{m.tokens.toLocaleString()}</td>
                                                <td className="py-4 text-right font-medium text-theme-title text-sm">{m.requests}</td>
                                                <td className="py-4 text-right font-black text-theme-primary text-sm">$ {(m.tokens * 0.0000015).toFixed(4)}</td>
                                            </tr>
                                        ))}
                                        {(!usage?.models || usage.models.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-theme-muted text-sm italic">Nenhum dado de uso detalhado disponível.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </ExpandableCard>
                    </div>
                )}

                {activeTab === 'providers' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Provedores Estáticos */}
                        {SERVICES.map(service => {
                            const userKey = keys.find(k => k.service === service.id);
                            return (
                                <ProviderCard
                                    key={service.id}
                                    service={service}
                                    userKey={userKey}
                                    onDelete={handleDeleteKey}
                                    onSave={handleAddKey}
                                    newKey={newKey}
                                    setNewKey={setNewKey}
                                    selectedService={selectedService}
                                    setSelectedService={setSelectedService}
                                    verifying={verifying}
                                    validationError={validationError}
                                />
                            );
                        })}

                        {/* Provedores Personalizados */}
                        {keys.filter(k => !SERVICES.map(s => s.id).includes(k.service)).map(userKey => (
                            <ProviderCard
                                key={userKey.service}
                                service={{
                                    id: userKey.service,
                                    name: userKey.service.charAt(0).toUpperCase() + userKey.service.slice(1),
                                    url: '#'
                                }}
                                userKey={userKey}
                                onDelete={handleDeleteKey}
                                onSave={handleAddKey}
                                newKey={newKey}
                                setNewKey={setNewKey}
                                selectedService={selectedService}
                                setSelectedService={setSelectedService}
                                verifying={verifying}
                                validationError={validationError}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'catalog' && (
                    <ModelsTab
                        apiKeys={keys}
                        catalogModels={models}
                        catalogStatus={catalogStatus}
                        userPrefs={userPrefs}
                        onSyncCatalog={async () => {
                            await modelCatalogApi.sync();
                            loadData();
                        }}
                    />
                )}

                {activeTab === 'preferences' && (
                    <div className="bg-theme-card/50 border border-theme-border rounded-3xl overflow-hidden shadow-theme">
                        <ModelPreferences userProfile={profile} />
                    </div>
                )}
                {/* Add Key Modal (Overlay) */}
                {isAddingMode && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-theme-body/80 backdrop-blur-md" onClick={() => setIsAddingMode(false)}></div>
                        <div className="relative w-full max-w-lg bg-theme-card border border-theme-border rounded-3xl shadow-theme p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-2xl font-black text-theme-title tracking-tight flex items-center gap-2">
                                <Plus className="w-6 h-6 text-theme-primary" />
                                Configurar Provedor
                            </h2>

                            <form onSubmit={(e) => handleAddKey(e, selectedService as any, newKey as any)} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">Selecione o Serviço</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {SERVICES.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedService(s.id);
                                                    setIsCustomService(false);
                                                }}
                                                className={`p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${selectedService === s.id && !isCustomService
                                                    ? 'bg-theme-primary text-white border-theme-primary shadow-lg shadow-theme-primary/20 scale-105'
                                                    : 'bg-theme-body border-theme-border text-theme-muted hover:border-theme-primary/50'
                                                    }`}
                                            >
                                                {s.name.split(' ')[0]}
                                            </button>
                                        ))}
                                        <button
                                            key="other"
                                            type="button"
                                            onClick={() => setIsCustomService(true)}
                                            className={`p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${isCustomService
                                                ? 'bg-theme-primary text-white border-theme-primary shadow-lg shadow-theme-primary/20 scale-105'
                                                : 'bg-theme-body border-theme-border text-theme-muted hover:border-theme-primary/50'
                                                }`}
                                        >
                                            Outro...
                                        </button>
                                    </div>
                                </div>

                                {isCustomService && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] ml-2">Nome do Provedor</label>
                                        <input
                                            type="text"
                                            value={customServiceName}
                                            onChange={(e) => {
                                                setCustomServiceName(e.target.value);
                                                setSelectedService(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                            }}
                                            className="w-full bg-theme-body border border-theme-border p-4 rounded-xl focus:border-theme-primary outline-none transition-all placeholder:text-theme-muted/30 font-bold text-sm"
                                            placeholder="Ex: LocalLLM, Ollama..."
                                            required
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest ml-1">Chave de API (API Key)</label>
                                    <input
                                        type="password"
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        className="w-full bg-theme-body border border-theme-border p-4 rounded-2xl focus:border-theme-primary outline-none transition-all placeholder:text-theme-muted/40 font-medium"
                                        placeholder="Cole aqui sua chave de API..."
                                        required
                                    />
                                </div>

                                <div className="bg-theme-body/50 p-4 rounded-2xl border border-theme-border flex gap-3">
                                    <Info className="w-5 h-5 text-theme-primary shrink-0" />
                                    <p className="text-[11px] text-theme-muted leading-relaxed">
                                        Sua chave será armazenada de forma segura e criptografada em nosso banco de dados.
                                        Ela nunca será exposta na interface após ser salva.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-theme-primary text-white font-bold rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-theme-primary/20 cursor-pointer"
                                >
                                    Salvar Configuração
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProviderCard: React.FC<{
    service: any;
    userKey: any;
    onDelete: (service: string) => void;
    onSave: (e: any, serviceId: any, keyToSave: any) => void;
    newKey: string;
    setNewKey: (val: string) => void;
    selectedService: string;
    setSelectedService: (val: string) => void;
    verifying: Record<string, boolean>;
    validationError: Record<string, string | null>;
}> = ({
    service, userKey, onDelete, onSave, newKey, setNewKey,
    selectedService, setSelectedService, verifying, validationError
}) => (
        <div
            className={`group p-5 rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[260px] ${userKey
                ? 'bg-theme-card border-theme-primary/30 shadow-xl scale-100'
                : 'bg-theme-card/30 border-theme-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]'
                }`}
        >
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-0.5">
                        <div className="text-[9px] font-black text-theme-primary uppercase tracking-widest">{userKey ? 'Ativo' : 'Offline'}</div>
                        <h3 className="text-base font-black text-theme-title tracking-tight truncate max-w-[140px]">{service.name}</h3>
                    </div>
                    {userKey ? (
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                    ) : (
                        <div className="p-2 bg-theme-secondary/10 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-theme-muted" />
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {userKey ? (
                        <div className="p-3 bg-theme-secondary/5 rounded-xl border border-theme-border/50 font-mono text-[10px] text-theme-muted/50 overflow-hidden flex justify-between items-center group/key">
                            <span className="truncate mr-2">••••••••••••••••</span>
                            <button
                                onClick={() => onDelete(service.id)}
                                className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover/key:opacity-100"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="p-3 bg-theme-secondary/5 rounded-xl border border-theme-border/50 text-[9px] text-theme-muted italic text-center leading-relaxed">
                            Provedor não configurado.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {!userKey && (
                    <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-300">
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="API Key..."
                                className="w-full bg-theme-secondary/5 border border-theme-border p-3 rounded-xl focus:border-theme-primary outline-none transition-all placeholder:text-theme-muted/40 font-bold text-[10px] pr-10"
                                value={selectedService === service.id ? newKey : ''}
                                onChange={(e) => {
                                    setSelectedService(service.id);
                                    setNewKey(e.target.value);
                                }}
                            />
                            {verifying[service.id] && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <RefreshCw className="w-3 h-3 text-theme-primary animate-spin" />
                                </div>
                            )}
                        </div>
                        {validationError[service.id] && (
                            <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest px-1 italic">
                                {validationError[service.id]}
                            </p>
                        )}
                        <button
                            onClick={(e) => onSave(e, service.id, newKey)}
                            disabled={!newKey.trim() || verifying[service.id]}
                            className="w-full py-3 bg-theme-primary disabled:opacity-50 text-white font-black rounded-xl hover:brightness-110 active:scale-95 transition-all text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-theme-primary/10"
                        >
                            {verifying[service.id] ? '...' : 'Ativar'}
                        </button>
                    </div>
                )}

                {service.url !== '#' && (
                    <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-theme-secondary/10 hover:bg-theme-secondary/20 text-theme-title font-black rounded-xl transition-all text-[9px] uppercase tracking-widest border border-theme-border/50"
                    >
                        Obter Chave <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
            <Key className="absolute -right-8 -bottom-8 w-32 h-32 text-theme-primary/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform" />
        </div>
    );

export default ApiKeysPage;
