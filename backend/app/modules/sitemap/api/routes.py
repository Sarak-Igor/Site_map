from fastapi import APIRouter, HTTPException, status
from ..schemas.sitemap_schema import SitemapGenerateRequest, SitemapGraphResponse
from ..services.sitemap_parser_service import SitemapParserService

router = APIRouter(
    prefix="/sitemap",
    tags=["Sitemap & Mindmap"]
)

@router.post(
    "/generate", 
    response_model=SitemapGraphResponse,
    status_code=status.HTTP_200_OK,
    summary="Gera um Sitemap Grafo",
    description="Recebe uma lista com nodes e parent_ids e retorna os grafos prontos para desenhar."
)
def generate_sitemap(payload: SitemapGenerateRequest):
    try:
        # Injeção/Chamada para a camada de serviços (Isolando Regra de Negócio)
        graph_response = SitemapParserService.parse_list_to_graph(payload.items)
        return graph_response
    except Exception as e:
        # Padrão global de erro estruturado 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao processar e mapear o sitemap: {str(e)}"
        )
