import pytest
from app.modules.sitemap.schemas.sitemap_schema import SitemapItemInput
from app.modules.sitemap.services.sitemap_parser_service import SitemapParserService

def test_parse_list_to_graph_success():
    # 1. Arrange: Cenário Base (Raiz -> Financeiro)
    input_items = [
        SitemapItemInput(id="1", label="Home", parent_id=None),
        SitemapItemInput(id="2", label="Dashboard", parent_id="1"),
        SitemapItemInput(id="3", label="Relatórios", parent_id="1"),
        SitemapItemInput(id="4", label="Sub-Relatório", parent_id="3")
    ]
    
    # 2. Act
    response = SitemapParserService.parse_list_to_graph(input_items)
    
    # 3. Assert Nodes
    assert len(response.nodes) == 4
    
    node_ids = {node.id for node in response.nodes}
    assert node_ids == {"1", "2", "3", "4"}
    
    # Assert Edges (Lógica crua de conexão)
    assert len(response.edges) == 3
    
    # Aresta do Home pro Dashboard (1 -> 2)
    edge_home_dash = next(e for e in response.edges if e.target == "2")
    assert edge_home_dash.source == "1"
    
    # Aresta do Relatórios pro Sub-Relatório (3 -> 4)
    edge_rel_sub = next(e for e in response.edges if e.target == "4")
    assert edge_rel_sub.source == "3"

def test_parse_list_to_graph_ignores_invalid_parent():
    # 1. Arrange: Alguém aponta pra um nó '999' que não existe.
    input_items = [
        SitemapItemInput(id="10", label="Start", parent_id=None),
        SitemapItemInput(id="20", label="Orphan", parent_id="999"), # Inválido!
    ]
    
    # 2. Act
    response = SitemapParserService.parse_list_to_graph(input_items)
    
    # 3. Assert
    assert len(response.nodes) == 2 # O nó ainda renderiza
    assert len(response.edges) == 0 # A linha não conecta no vazio (Evita quebrar o renderizador visual)
