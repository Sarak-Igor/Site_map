from typing import List
from ..schemas.sitemap_schema import SitemapItemInput, SitemapGraphResponse, SitemapNode, SitemapEdge

class SitemapParserService:
    """
    Serviço puro de domínio.
    Responsabilidade: Pegar uma lista linear (referenciando parent_id)
    e convertê-la num grafo bidimensional seguro e limpo para o Frontend.
    """
    
    @staticmethod
    def parse_list_to_graph(items: List[SitemapItemInput]) -> SitemapGraphResponse:
        nodes: List[SitemapNode] = []
        edges: List[SitemapEdge] = []
        
        # Mapeamento rápido para validação de existência de pai
        item_ids = {item.id for item in items}
        
        for item in items:
            # 1. Monta o Node
            node = SitemapNode(
                id=item.id,
                label=item.label,
                data={"label": item.label} # Formatado pensando em React Flow
            )
            nodes.append(node)
            
            # 2. Monta as Edges (Somente se tem parente e se o parente realmente existe na lista)
            if item.parent_id and item.parent_id in item_ids:
                edge_id = f"e-{item.parent_id}-{item.id}"
                edge = SitemapEdge(
                    id=edge_id,
                    source=item.parent_id,
                    target=item.id
                )
                edges.append(edge)
                
        return SitemapGraphResponse(nodes=nodes, edges=edges)
