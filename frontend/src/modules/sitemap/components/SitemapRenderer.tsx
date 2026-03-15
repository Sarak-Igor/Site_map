import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
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
const getLayoutedElements = (visibleNodes: GraphNode[], visibleEdges: GraphEdge[], direction = 'TB', templateId?: string) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    const isHorizontal = direction === 'LR';
    const isRoadmap = ['timeline', 'milestone', 'gantt', 'wave', 'isometric', 'minimal', 'blueprint', 'glass', 'winding', 'zigzag'].includes(templateId || '');

    // Ajustes específicos para Roadmap: Maior separação entre ranks (fases) e muito maior entre nós do mesmo rank (para alternância)
    const isHighExpansion = ['wave', 'timeline', 'isometric', 'glass', 'winding', 'zigzag'].includes(templateId || '');
    const nodesep = isHighExpansion ? 350 : (isRoadmap ? 180 : 60); 
    const ranksep = templateId === 'wave' ? 400 : (isRoadmap ? 220 : 80);

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

    const layoutedNodes = visibleNodes.map((node, idx) => {
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


const SitemapRenderer = ({ rawNodes, rawEdges, templateId, layoutDirection, nodeColor, colorMode = 'mono', edgeColorMode = 'colored' }: { 
    rawNodes: any[], 
    rawEdges: any[], 
    templateId: string, 
    layoutDirection: string,
    nodeColor?: string,
    colorMode?: 'mono' | 'multi',
    edgeColorMode?: 'colored' | 'bw'
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>([]);
    
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

        // --- ALGORITMO DE DEPTH (Profundidade) ---
        // Necessário para pintar as cores regressivamente
        const nodeDepths: Record<string, number> = {};
        
        // BFS (Breadth-First Search) partindo dos roots
        let queue = rootNodes.map(r => ({ id: r.id, depth: 0 }));
        while(queue.length > 0) {
            const current = queue.shift()!;
            if (nodeDepths[current.id] === undefined) {
                nodeDepths[current.id] = current.depth;
                
                // Encontra os filhos e adiciona na fila com depth + 1
                const childrenEdges = rawEdges.filter(e => e.source === current.id);
                childrenEdges.forEach(edge => {
                    queue.push({ id: edge.target, depth: current.depth + 1 });
                });
            }
        }

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

        // Se for Roadmap, forçamos a Espinha Principal REAL (Sequência absoluta de irmãos)
        if (isRoadmap) {
            layoutEdges = []; 
            
            // 1. Processamos os Roots e seus filhos imediatos (A "Espinha")
            rootNodes.forEach(root => {
                const immediateChildren = rawEdges
                    .filter(e => e.source === root.id)
                    .map(e => e.target);
                    
                if (immediateChildren.length > 0) {
                    // O Root aponta APENAS para o primeiro filho
                    layoutEdges.push({ 
                        id: `spine-start-${root.id}`, 
                        source: root.id, 
                        target: immediateChildren[0] 
                    });

                    // Encadeia todos os irmãos em uma linha única (Espinha)
                    for (let i = 0; i < immediateChildren.length - 1; i++) {
                        layoutEdges.push({ 
                            id: `spine-chain-${immediateChildren[i]}-${immediateChildren[i+1]}`, 
                            source: immediateChildren[i], 
                            target: immediateChildren[i+1] 
                        });
                    }
                }
            });

            // 2. Processamos os descendentes profundos (Níveis 2+)
            // Eles se conectam normalmente aos seus pais, sem encadeamento de irmãos (para agrupar abaixo da fase)
            const deepEdges = rawEdges.filter(e => {
                const isFromRoot = rootNodes.some(r => r.id === e.source);
                return !isFromRoot; // Pega tudo que não sai do root (sub-tarefas)
            });
            
            layoutEdges = [...layoutEdges, ...deepEdges];
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
        
        // Lógica de Cor das Edges baseada no novo toggle
        const getBaseEdgeColor = () => {
            if (edgeColorMode === 'bw') {
                return (isNeoBrutalist || isRetro) ? 'var(--text-title)' : 'var(--border-color)';
            }
            // Se for colorido, segue a regra anterior
            if (isGrap || isNeoBrutalist) return isNeoBrutalist ? 'var(--text-title)' : (nodeColor || '#4ade80');
            return (templateId === 'mindmap' || templateId === 'glass' ? 'var(--border-color)' : 'var(--text-muted)');
        };

        const baseEdgeColor = getBaseEdgeColor();

        const draftEdges = layoutEdges.map(e => {
            let finalStroke = baseEdgeColor;
            
            // Se estiver em modo colorido, podemos usar a cor do ramo
            if (edgeColorMode === 'colored' && colorMode === 'multi' && branchColors[e.target]) {
                finalStroke = branchColors[e.target];
            } else if (edgeColorMode === 'colored' && colorMode === 'mono') {
                finalStroke = nodeColor || baseEdgeColor;
            }

            return {
                ...e,
                type: edgeType,
                animated: templateId !== 'orgchart' && !isGrap && templateId !== 'retro', 
                isHidden: currentlyHiddenNodeIds.has(e.target) || currentlyHiddenNodeIds.has(e.source),
                style: { 
                    stroke: finalStroke, 
                    strokeWidth: isRoadmap ? 4 : ((isGrap || isNeoBrutalist) ? 3 : (templateId === 'mindmap' ? 2 : 1.5)), 
                    opacity: (isGrap || isRoadmap) ? 1 : 0.8 
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
            templateId
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [rawNodes, rawEdges, templateId, layoutDirection, nodeColor, colorMode, collapsedNodes, getHiddenDescendants, handleToggleCollapse, setNodes, setEdges]);


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
};

export default SitemapRenderer;
