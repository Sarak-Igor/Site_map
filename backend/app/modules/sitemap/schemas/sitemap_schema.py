from typing import List, Optional, Dict
from pydantic import BaseModel, Field

# ---------------------------------------------------------
# Input Schemas (O que o usuário/frontend envia para criar)
# ---------------------------------------------------------

class SitemapItemInput(BaseModel):
    id: str = Field(..., description="Identificador único do nó na lista original")
    label: str = Field(..., description="Texto ou nome que aparecerá no nó")
    parent_id: Optional[str] = Field(None, description="O ID pai deste nó. Se nulo, é um nó raiz.")

class SitemapGenerateRequest(BaseModel):
    items: List[SitemapItemInput] = Field(..., description="Lista plana dos itens para formar o mapa")

# ---------------------------------------------------------
# Output Schemas (A resposta estruturada do Backend - Graph)
# ---------------------------------------------------------

class SitemapNode(BaseModel):
    id: str = Field(..., description="ID do nó, útil para as edges e React Flow")
    label: str = Field(..., description="Texto do nó (ex: 'Financeiro')")
    data: Dict[str, str] = Field(default_factory=dict, description="Payload customizável para o frontend")

class SitemapEdge(BaseModel):
    id: str = Field(..., description="ID único para esta linha conectiva (source-target)")
    source: str = Field(..., description="ID do nó de origem (Pai)")
    target: str = Field(..., description="ID do nó de destino (Filho)")

class SitemapGraphResponse(BaseModel):
    nodes: List[SitemapNode] = Field(default_factory=list, description="Todos os blocos renderizáveis")
    edges: List[SitemapEdge] = Field(default_factory=list, description="Todas as conexões/linhas")
