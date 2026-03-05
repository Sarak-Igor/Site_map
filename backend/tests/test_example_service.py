import pytest

# ---------------------------------------------------------------------------
# 🧪 EDUCAÇÃO: COMO TESTAR LÓGICAS DE NEGÓCIO NO BACKEND
# ---------------------------------------------------------------------------
# Todo projeto que nasce a partir do `Code - base` deve isolar suas regras de
# negócio na camada `services/` dentro de cada módulo. 
#
# Seus testes (como este) devem focar unicamente em testar essas funções.
# ---------------------------------------------------------------------------

# Exemplo de uma regra de negócio simples
def calcular_imposto(valor: float, is_isento: bool) -> float:
    if is_isento:
        return 0.0
    return valor * 0.15


# ---------------------------------------------------------------------------
# SUÍTE DE TESTES (Pytest)
# ---------------------------------------------------------------------------
class TestExampleService:
    
    def test_calcular_imposto_com_valor_normal(self):
        # Arrange
        valor_base = 100.0
        
        # Act
        resultado = calcular_imposto(valor=valor_base, is_isento=False)
        
        # Assert
        assert resultado == 15.0
        
    def test_calcular_imposto_para_isento(self):
        # Act
        resultado = calcular_imposto(valor=100.0, is_isento=True)
        
        # Assert
        assert resultado == 0.0
