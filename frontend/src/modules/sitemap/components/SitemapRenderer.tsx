import React, { useCallback, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    getNodesBounds,
    Node,
    Edge,
    Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// @ts-ignore
import dagre from 'dagre';

interface GraphNode extends Node {
    data: any;
}

interface GraphEdge extends Edge {
}
import CustomSitemapNode from './CustomSitemapNode';

// Registra nosso componente mágico de UI para o React Flow usar
const nodeTypes = {
    custom: CustomSitemapNode,
};

const nodeWidth = 220; // Aproximação do tamanho do card do CustomNode
const nodeHeight = 60;

/**
 * Função utilitária para aplicar o Layout Organizacional
 */
const getLayoutedElements = (visibleNodes: GraphNode[], visibleEdges: GraphEdge[], direction = 'TB', templateId?: string, spacing: string = 'm') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    const isRoadmap = ['timeline', 'milestone', 'gantt', 'wave', 'isometric', 'minimal', 'blueprint', 'glass', 'winding', 'zigzag'].includes(templateId || '');

    // Mapeamento de escalas de espaçamento
    const spacingMap: Record<string, { node: number, rank: number }> = {
        pp: { node: 60, rank: 90 },
        p: { node: 90, rank: 135 },
        m: { node: 120, rank: 180 },
        g: { node: 180, rank: 270 },
        gg: { node: 240, rank: 360 }
    };
    const scale = spacingMap[spacing] || spacingMap.m;

    // Ajustes específicos para Roadmap: usa o scale como multiplicador sobre as bases
    const spacingMultiplier = ({ pp: 0.5, p: 0.75, m: 1, g: 1.5, gg: 2.25 } as Record<string, number>)[spacing] ?? 1;
    const isHighExpansion = ['wave', 'timeline', 'isometric', 'glass', 'winding', 'zigzag'].includes(templateId || '');
    const nodesep = isHighExpansion ? Math.round(350 * spacingMultiplier) : (isRoadmap ? Math.round(180 * spacingMultiplier) : scale.node);
    const ranksep = templateId === 'wave' ? Math.round(400 * spacingMultiplier) : (isRoadmap ? Math.round(220 * spacingMultiplier) : scale.rank);

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep,
        ranksep,
        ranker: isRoadmap ? 'longest-path' : 'network-simplex'
    });

    visibleNodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    visibleEdges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = visibleNodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        let x = nodeWithPosition.x - nodeWidth / 2;
        let y = nodeWithPosition.y - nodeHeight / 2;

        // Efeito de Estrada Sinuosa ou Zig-Zag (Alternância de X para layout vertical)
        if (!isHorizontal && (templateId === 'winding' || templateId === 'zigzag')) {
            const isRight = (node.data?.depth || 0) % 2 !== 0; // Alterna baseado na profundidade na espinha
            x += isRight ? 180 : -180;
        }

        return {
            ...node,
            targetPosition: (isHorizontal ? 'left' : 'top') as Position,
            sourcePosition: (isHorizontal ? 'right' : 'bottom') as Position,
            position: { x, y },
        };
    });

    return { nodes: layoutedNodes, edges: visibleEdges };
};


const SitemapRendererContent = forwardRef(({ rawNodes, rawEdges, templateId, layoutDirection, nodeColor, colorMode = 'mono', edgeColorMode = 'colored', spacing = 'm', edgeWidth = 'm' }: {
    rawNodes: any[],
    rawEdges: any[],
    templateId: string,
    layoutDirection: string,
    nodeColor?: string,
    colorMode?: 'mono' | 'multi',
    edgeColorMode?: 'colored' | 'bw',
    spacing?: string,
    edgeWidth?: string
}, ref) => {
    const { getNodes, setViewport, getViewport, fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>([]);

    // Expõe a lógica de captura e dados para o Builder
    useImperativeHandle(ref, () => ({
        getBounds: () => {
            const currentNodes = getNodes();
            if (currentNodes.length === 0) return null;
            return getNodesBounds(currentNodes);
        },
        getNodes: () => getNodes(),
        getEdges: () => edges,
        getViewport: () => getViewport(),
        setViewport: (vp: { x: number; y: number; zoom: number }) => setViewport(vp, { duration: 0 }),
        fitView: () => fitView({ padding: 0.1, duration: 0 })
    }));

    // Estado de quais Nós estão colapsados/encolhidos. Guarda os IDs.
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

    // 1. Função Recursiva para Descobrir quem deve ser Escondido
    const getHiddenDescendants = useCallback((nodeId: string, edgesArray: any[]): string[] => {
        const childrenEdges = edgesArray.filter(e => e.source === nodeId);
        const childrenIds = childrenEdges.map(e => e.target);

        let allDescendants = [...childrenIds];
        for (const childId of childrenIds) {
            allDescendants = allDescendants.concat(getHiddenDescendants(childId, edgesArray));
        }
        return allDescendants;
    }, []);

    // Função de clique do Collapse
    const handleToggleCollapse = useCallback((nodeId: string) => {
        setCollapsedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) newSet.delete(nodeId); else newSet.add(nodeId);
            return newSet;
        });
    }, []);

    // Efeito Principal de Processamento do Grafo
    useEffect(() => {
        if (!rawNodes || rawNodes.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }

        // --- DEFINIR DIRETRIZES DE ORIENTAÇÃO ---
        const direction = layoutDirection === 'horizontal' ? 'LR' : 'TB';
        const isHorizontal = layoutDirection === 'horizontal';

        // Descobre quem é o Nó primário (Root)
        const rootNodes = rawNodes.filter(n => !rawEdges.some(e => e.target === n.id));

        // --- GESTÃO DE COLAPSO ---
        let currentlyHiddenNodeIds = new Set<string>();
        collapsedNodes.forEach(collapsedId => {
            const hiddenSubTree = getHiddenDescendants(collapsedId, rawEdges);
            hiddenSubTree.forEach(id => currentlyHiddenNodeIds.add(id));
        });

        // --- PALETA PARA MODO MULTI ---
        const multiPalette = [
            '#8b5cf6', // Roxo
            '#3b82f6', // Azul
            '#14b8a6', // Teal
            '#f59e0b', // Laranja
            '#eab308', // Amarelo
            '#ec4899', // Rosa
            '#06b6d4', // Ciano
        ];

        // Mapeamento de Cores por Ramo (para Modo Multi)
        const branchColors: Record<string, string> = {};
        if (colorMode === 'multi') {
            rootNodes.forEach((root: any) => {
                const branches = rawEdges.filter((e: any) => e.source === root.id);
                branches.forEach((edge: any, index: number) => {
                    const branchColor = multiPalette[index % multiPalette.length];

                    // Função interna para pintar toda a subárvore recursivamente
                    const paintDescendants = (nodeId: string, color: string) => {
                        branchColors[nodeId] = color;
                        const children = rawEdges.filter((e: any) => e.source === nodeId);
                        children.forEach((childEdge: any) => paintDescendants(childEdge.target, color));
                    };

                    paintDescendants(edge.target, branchColor);
                });
            });
        }

        // --- GESTÃO DE ARESTAS (EDGES) PARA LAYOUT E VISUAL ---
        const isRoadmap = ['timeline', 'milestone', 'gantt', 'wave', 'isometric', 'minimal', 'blueprint', 'glass', 'winding', 'zigzag'].includes(templateId || '');
        let layoutEdges = [...rawEdges];

        if (isRoadmap) {
            layoutEdges = [];
            const spineNodes: string[] = [];

            // 1. Determina quem faz parte da "Espinha Principal"
            if (rootNodes.length > 1) {
                // Se houver várias raízes, elas são a espinha
                spineNodes.push(...rootNodes.map(n => n.id));
            } else if (rootNodes.length === 1) {
                // Se houver apenas uma raiz, ela e seus filhos imediatos são a espinha
                const root = rootNodes[0];
                const immediateChildren = rawEdges
                    .filter(e => e.source === root.id)
                    .map(e => e.target);

                spineNodes.push(root.id, ...immediateChildren);
            }

            // 2. Cria o encadeamento linear da espinha
            for (let i = 0; i < spineNodes.length - 1; i++) {
                layoutEdges.push({
                    id: `spine-logic-${spineNodes[i]}-${spineNodes[i + 1]}`,
                    source: spineNodes[i],
                    target: spineNodes[i + 1]
                });
            }

            // 3. Adiciona as arestas originais que NÃO conflitam com a espinha (Ramificações)
            // Uma aresta é mantida se o seu 'target' não for um nó que já recebeu um pai na espinha
            rawEdges.forEach(e => {
                const targetIsAlreadyInSpineChain = layoutEdges.some(le => le.target === e.target);
                if (!targetIsAlreadyInSpineChain) {
                    layoutEdges.push(e);
                }
            });
        }

        // --- ALGORITMO DE DEPTH (Profundidade) ---
        // Recalculado usando layoutEdges para Roadmaps (para espinha ter níveis sequenciais)
        const nodeDepths: Record<string, number> = {};
        let queue = rootNodes.map(r => ({ id: r.id, depth: 0 }));
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (nodeDepths[current.id] === undefined) {
                nodeDepths[current.id] = current.depth;
                const childrenEdges = layoutEdges.filter(e => e.source === current.id);
                childrenEdges.forEach(edge => {
                    queue.push({ id: edge.target, depth: current.depth + 1 });
                });
            }
        }

        // --- PALETA PARA MODO MULTI ---

        // --- MONTAGEM DOS NÓS (DRAFT) ---
        const draftNodes = rawNodes.map(node => {
            const isRoot = rootNodes.some(r => r.id === node.id);
            const hasChildren = layoutEdges.some(e => e.source === node.id);
            const isCollapsed = collapsedNodes.has(node.id);
            const depth = nodeDepths[node.id] || 0; // Assume 0 se solto

            // Calcula o índice entre irmãos (nós que compartilham o mesmo pai)
            const parentEdge = rawEdges.find(e => e.target === node.id);
            const siblings = parentEdge
                ? rawEdges.filter(e => e.source === parentEdge.source).map(e => e.target)
                : rootNodes.map(r => r.id);
            const index = siblings.indexOf(node.id);

            return {
                ...node,
                type: 'custom',
                isHidden: currentlyHiddenNodeIds.has(node.id),
                data: {
                    label: node.data?.label || node.label || 'Nó Desconhecido',
                    isRoot,
                    hasChildren,
                    isCollapsed,
                    onToggleCollapse: handleToggleCollapse,
                    sourcePosition: isHorizontal ? 'right' : 'bottom',
                    targetPosition: isHorizontal ? 'left' : 'top',
                    templateId: templateId,
                    nodeColor: colorMode === 'multi' && branchColors[node.id] ? branchColors[node.id] : nodeColor,
                    depth: depth,
                    index: index, // Novo: Índice do nó para alternância visual
                    childCount: layoutEdges.filter(e => e.source === node.id).length,
                    status: node.status,
                    timeline: node.timeline,
                    progress: node.progress,
                    description: node.description
                }
            };
        });

        // --- ESTILIZAÇÃO DE ARESTAS (EDGES) ---
        const isGrap = templateId === 'grap';
        const isNeoBrutalist = templateId === 'neobrutalist';
        const isRetro = templateId === 'retro';

        const edgeType = (templateId === 'mindmap' || templateId === 'glass' || templateId === 'hologram') ? 'default' : 'smoothstep';

        // Mapeamento de largura de linhas
        const edgeWidthMap: Record<string, number> = {
            pp: 1,
            p: 1.5,
            m: 2.5,
            g: 4,
            gg: 6
        };
        const resolvedEdgeWidth = edgeWidthMap[edgeWidth || 'm'] ?? 2.5;

        // Cor das linhas: resolve cor do tema dinamicamente para funcionar em P&B e Colorido
        // Usando um elemento de referência para ler CSS custom properties em runtime
        const getResolvedColor = (cssVar: string): string => {
            const el = document.documentElement;
            return getComputedStyle(el).getPropertyValue(cssVar).trim() || '#94a3b8';
        };

        const getBwColor = (): string => {
            // P&B: usa a cor do texto do tema para que funcione em claro e escuro
            if (isNeoBrutalist || isRetro) return getResolvedColor('--text-title');
            return getResolvedColor('--text-muted');
        };

        const getColoredColor = (): string => {
            if (isGrap) return nodeColor || '#4ade80';
            if (isNeoBrutalist) return getResolvedColor('--text-title');
            return nodeColor || '#3b82f6';
        };

        const draftEdges = layoutEdges.map(e => {
            let finalStroke: string;

            if (edgeColorMode === 'bw') {
                finalStroke = getBwColor();
            } else {
                // Colorido
                if (colorMode === 'multi' && branchColors[e.target]) {
                    finalStroke = branchColors[e.target];
                } else {
                    finalStroke = getColoredColor();
                }
            }

            return {
                ...e,
                type: edgeType,
                animated: templateId !== 'orgchart' && !isGrap && templateId !== 'retro',
                isHidden: currentlyHiddenNodeIds.has(e.target) || currentlyHiddenNodeIds.has(e.source),
                style: {
                    stroke: finalStroke,
                    strokeWidth: resolvedEdgeWidth,
                    opacity: (isGrap || isRoadmap) ? 1 : 0.85
                }
            };
        });

        // Filtra nós/edges visíveis
        const visibleNodes = draftNodes.filter(n => !n.isHidden);
        const visibleEdges = draftEdges.filter(e => !e.isHidden);

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            visibleNodes,
            visibleEdges,
            direction,
            templateId,
            spacing
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [rawNodes, rawEdges, templateId, layoutDirection, nodeColor, colorMode, edgeColorMode, edgeWidth, spacing, collapsedNodes, getHiddenDescendants, handleToggleCollapse, setNodes, setEdges]);


    // Para o React Flow não recriar os Types em todo Render (Performance)
    const memoizedNodeTypes = useMemo(() => nodeTypes, []);

    if (!rawNodes || rawNodes.length === 0) return null;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={memoizedNodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.3, duration: 800 }} // Animação de câmera suave
                minZoom={0.1}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={true} // Permitir usuário reorganizar manualmente!
            >
                <Background color="#334155" gap={24} size={1} />
                <Controls className="bg-theme-sidebar border-theme-border text-theme-title fill-theme-title" />
            </ReactFlow>
        </div>
    );
});

// Componente principal que provê o contexto do React Flow
const SitemapRenderer = forwardRef((props: any, ref) => {
    return (
        <ReactFlowProvider>
            <SitemapRendererContent {...props} ref={ref} />
        </ReactFlowProvider>
    );
});

export default SitemapRenderer;
