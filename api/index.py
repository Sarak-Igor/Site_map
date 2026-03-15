import sys
import os

# Adiciona o diretório 'backend' ao path para que o app possa ser importado
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
