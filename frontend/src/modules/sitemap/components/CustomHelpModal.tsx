import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlignLeft, Code, Monitor, Layers } from 'lucide-react';

interface CustomHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomHelpModal = ({ isOpen, onClose }: CustomHelpModalProps) => {
    const [activeTab, setActiveTab] = useState<'text' | 'roadmap' | 'items' | 'json'>('text');

    const downloadSkeleton = (type: 'mindmap' | 'roadmap' | 'items' | 'json') => {
        let content = "";
        let filename = "";

        if (type === 'mindmap') {
            content = "1- Estrutura Corporativa\n1.1- Diretoria Tech\n1.1.1- Engenharia\n1.1.1.1- Sub-item 1\n1.1.1.2- Sub-item 2\n1.2- Diretoria Comercial\n1.2.1- Marketing\n1.2.1.1- Sub-item 3";
            filename = "template_mapa_mental.txt";
        } else if (type === 'roadmap') {
            content = "1- Projeto Roadmap 2026\n1.1- Fase 1: Planejamento [Status] {Timeline} (0%)\n1.1.1- Tarefa A\n1.1.1.1- Sub-tarefa A1\n1.1.2- Tarefa B\n1.2- Fase 2: Execução [Status] {Timeline} (0%)";
            filename = "template_roadmap.txt";
        } else if (type === 'items') {
            content = "1- Mapa de Componentes\n1.1- Módulo Auth | Gerencia login e tokens\n1.1.1- Frontend | React Components\n1.1.1.1- Login Page | Interface de entrada\n1.1.2- Backend | Node.js API\n1.1.2.1- API Auth | Endpoint de validação";
            filename = "template_mapa_itens.txt";
        } else if (type === 'json') {
            content = JSON.stringify({
                name: "Novo Projeto",
                children: [
                    { name: "Fase 1", children: [{ name: "Tarefa 1.1" }] },
                    { name: "Fase 2" }
                ]
            }, null, 2);
            filename = "template_estrutura.json";
        }

        const element = document.createElement("a");
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-3xl bg-theme-body border border-theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Cabeçalho do Modal */}
                    <div className="flex items-center justify-between p-6 border-b border-theme-border bg-theme-sidebar/50">
                        <div>
                            <h2 className="text-lg font-black tracking-wide text-theme-title">
                                Como estruturar sua Entrada
                            </h2>
                            <p className="text-xs text-theme-muted mt-1">
                                Siga os padrões abaixo para gerar Mapas Mentais perfeitos com múltiplas camadas.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-theme-card border border-theme-border text-theme-muted hover:text-white hover:bg-theme-primary transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Abas Superiores */}
                    <div className="flex px-6 pt-4 space-x-2 bg-theme-sidebar/30">
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
                                activeTab === 'text'
                                    ? 'bg-theme-card text-theme-primary border-t border-l border-r border-theme-border'
                                    : 'text-theme-muted hover:text-theme-title'
                            }`}
                        >
                            <AlignLeft className="w-4 h-4" />
                            Hierarquia de Texto
                        </button>
                        <button
                            onClick={() => setActiveTab('roadmap')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
                                activeTab === 'roadmap'
                                    ? 'bg-theme-card text-emerald-500 border-t border-l border-r border-theme-border'
                                    : 'text-theme-muted hover:text-theme-title'
                            }`}
                        >
                            <Monitor className="w-4 h-4" />
                            Roadmap
                        </button>
                        <button
                            onClick={() => setActiveTab('items')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
                                activeTab === 'items'
                                    ? 'bg-theme-card text-amber-500 border-t border-l border-r border-theme-border'
                                    : 'text-theme-muted hover:text-theme-title'
                            }`}
                        >
                            <Layers className="w-4 h-4" />
                            Mapa de Itens
                        </button>
                        <button
                            onClick={() => setActiveTab('json')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
                                activeTab === 'json'
                                    ? 'bg-theme-card text-theme-primary border-t border-l border-r border-theme-border'
                                    : 'text-theme-muted hover:text-theme-title'
                            }`}
                        >
                            <Code className="w-4 h-4" />
                            Formato JSON (Dev)
                        </button>
                    </div>

                    {/* Conteúdo das Abas */}
                    <div className="p-6 bg-theme-card overflow-y-auto custom-scrollbar flex-1">
                        {activeTab === 'text' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-theme-main">
                                    O motor identifica os níveis de profundidade (pai/filho) baseando-se no <strong>prefixo numérico (Hierarquia)</strong> inserido antes de cada palavra, separados por ponto.
                                </p>
                                <div className="p-4 bg-theme-body rounded-xl border border-theme-border">
                                    <h4 className="text-xs font-bold text-theme-primary mb-3">Exemplo Estrutura Corporativa (Níveis Numéricos):</h4>
                                    <pre className="text-sm font-mono text-theme-title bg-black/40 p-4 rounded-lg overflow-auto leading-relaxed border border-white/5 max-h-[400px] custom-scrollbar">
{`1- Holding Internacional
1.1- Norte América (Regional)
1.1.1- Logística
1.1.1.1- Frota de Entrega
1.1.1.1.1- Veículos Elétricos (Nível 5)
1.1.1.1.2- Drones Autônomos
1.1.1.2- Gestão de Armazém
1.1.2- Desenvolvimento
1.1.2.1- Cloud Engineering
1.1.2.2- Produto UX
1.2- Europa & Ásia (Regional)
1.2.1- Customer Success
1.2.2- Vendas Enterprise
1.2.2.1- KAM Global
1.2.2.2- Inside Sales
1.2.3- Marketing Digital
1.2.3.1- SEO / SEM
1.2.3.2- Conteúdo Estratégico`}
                                    </pre>
                                </div>
                                <p className="text-xs text-theme-muted italic">
                                    <strong>Dica:</strong> Use os números separados por ponto final seguidos de um traço <kbd className="px-1.5 py-0.5 bg-theme-sidebar rounded font-mono text-white">1.1.2-</kbd> para definir em qual nível de profundidade cada texto se encontra.
                                </p>
                                <button 
                                    onClick={() => downloadSkeleton('mindmap')}
                                    className="w-full py-3 bg-theme-primary/10 border border-theme-primary/30 text-theme-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-theme-primary hover:text-white transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    <AlignLeft className="w-4 h-4" /> Baixar Template .TXT (Mind Map)
                                </button>
                            </motion.div>
                        )}
                        {activeTab === 'roadmap' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                    <h4 className="text-xs font-bold text-emerald-500 mb-2 flex items-center gap-2">
                                        🚀 Exemplo Soft. Timeline (Infográfico)
                                    </h4>
                                    <pre className="text-sm font-mono text-theme-title bg-black/40 p-4 rounded-lg overflow-auto leading-relaxed border border-white/5">
{`1- Soft. de Mensagens Instantâneas
1.1- Ideação e Brainstorming {Jan 2019} (100%)
1.1.1- Pesquisa Competitiva
1.1.2- Entrevistas com Usuários
1.2- Planejamento e Design {Mar 2019} (45%)
1.2.1- UI/UX Prototipagem
1.2.1.1- Wireframes Mobile
1.2.1.2- Design System Pro
1.3- Estruturação e Código {Abr 2019} (10%)
1.3.1- API de Mensageria
1.3.2- Notificações Push`}
                                    </pre>
                                </div>

                                <div className="p-4 bg-theme-body rounded-xl border border-theme-border">
                                    <h4 className="text-xs font-bold text-theme-primary mb-2 flex items-center gap-2">
                                        📊 Exemplo Gantt Profissional (Projec Management)
                                    </h4>
                                    <pre className="text-sm font-mono text-theme-title bg-black/40 p-4 rounded-lg overflow-auto leading-relaxed border border-white/5">
{`1- Planejamento Estratégico Netlinks
1.1- Fase de Planejamento [Atenção] {Jan - Fev}
1.1.1- Alocação de Recursos (100%) | Equipe técnica e budget
1.1.2- Planos de Trabalho (80%) | Cronograma detalhado
1.2- Fase de Testes [Em Progresso] {Maio - Jul}
1.2.1- Integração I (50%) | API e Middleware
1.2.2- Integração II (0%) | Frontend e Mobile
1.3- Desenvolvimento Core {Jun - Out}
1.3.1- Protótipo Beta (100%)
1.3.2- Build Experimental (20%)`}
                                    </pre>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    <div className="bg-theme-sidebar/30 p-3 rounded-lg border border-theme-border">
                                        <span className="text-[10px] font-black text-theme-primary uppercase block mb-1">Status</span>
                                        <code className="text-[10px] text-theme-title bg-black/20 px-1 rounded">[Texto]</code>
                                    </div>
                                    <div className="bg-theme-sidebar/30 p-3 rounded-lg border border-theme-border">
                                        <span className="text-[10px] font-black text-theme-primary uppercase block mb-1">Prazos</span>
                                        <code className="text-[10px] text-theme-title bg-black/20 px-1 rounded">{"{Data}"}</code>
                                    </div>
                                    <div className="bg-theme-sidebar/30 p-3 rounded-lg border border-theme-border">
                                        <span className="text-[10px] font-black text-theme-primary uppercase block mb-1">Progresso</span>
                                        <code className="text-[10px] text-theme-title bg-black/20 px-1 rounded">(0%)</code>
                                    </div>
                                    <div className="bg-theme-sidebar/30 p-3 rounded-lg border border-theme-border">
                                        <span className="text-[10px] font-black text-theme-primary uppercase block mb-1">Resumo</span>
                                        <code className="text-[10px] text-theme-title bg-black/20 px-1 rounded">| Desc</code>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => downloadSkeleton('roadmap')}
                                    className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Monitor className="w-4 h-4" /> Baixar Template .TXT (Roadmap)
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'items' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                    <h4 className="text-xs font-bold text-amber-500 mb-2 flex items-center gap-2">
                                        📄 Descrição Detalhada por Item
                                    </h4>
                                    <p className="text-xs text-theme-muted mb-4">
                                        Utilize o caractere pipe <code className="bg-theme-body px-1 font-bold">|</code> para separar o nome do item de sua descrição técnica.
                                    </p>
                                    <pre className="text-sm font-mono text-theme-title bg-black/40 p-4 rounded-lg overflow-auto leading-relaxed border border-white/5">
{`1- Infraestrutura Cloud | Setup completo na AWS
1.1- Camada de Dados | Bancos RDS e S3
1.1.1- User Records | Tabelas de perfil
1.1.1.1- Auth Data | Credenciais e hash
1.1.1.2- User Meta | Preferências
1.1.2- Media Streaming | Bucket de arquivos
1.2- Módulo de Segurança | Firewall e 2FA
1.2.1- WAF Setup | Proteção contra DDoS
1.2.2- SSL/TLS | Certificados`}
                                    </pre>
                                </div>

                                <button 
                                    onClick={() => downloadSkeleton('items')}
                                    className="w-full py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Layers className="w-4 h-4" /> Baixar Template .TXT (Mapa de Itens)
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'json' && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-theme-main">
                                    Para integrações avançadas de API, o sistema aceita objetos tipados em <strong className="text-amber-400">JSON</strong>, garantindo chaves exclusivas. (Módulo Analítico em implementação futura).
                                </p>
                                <div className="p-4 bg-theme-body rounded-xl border border-theme-border">
                                    <h4 className="text-xs font-bold text-theme-primary mb-3">Exemplo Sistema de Navegação:</h4>
                                    <pre className="text-sm font-mono text-amber-300/90 bg-black/60 p-4 rounded-lg overflow-auto leading-relaxed border border-white/5 shadow-inner max-h-[400px] custom-scrollbar">
{`{
  "name": "Ecosistema Digital",
  "children": [
    {
      "name": "Portal Web",
      "children": [
        { 
          "name": "Dashboard",
          "children": [
            { "name": "Vendas" },
            { "name": "Analytics" }
          ]
        },
        { "name": "Configurações" },
        { "name": "Perfil do Usuário" }
      ]
    },
    {
      "name": "Plataforma Mobile",
      "children": [
        { "name": "App iOS" },
        { "name": "App Android" },
        { "name": "PWA Web App" }
      ]
    },
    {
      "name": "API Services",
      "children": [
        { "name": "Auth Service" },
        { "name": "Data Crawler" }
      ]
    }
  ]
}`}
                                    </pre>
                                </div>

                                <button 
                                    onClick={() => downloadSkeleton('json')}
                                    className="w-full py-3 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    <Code className="w-4 h-4" /> Baixar Template .JSON (Desenvolvedor)
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CustomHelpModal;
