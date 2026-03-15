import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.sitemap.api.routes import router as sitemap_router

app = FastAPI(
    title="Sarak Enterprise API",
    description="Motor de Backend modular para o Sarak UI Engine",
    version="1.0.0"
)

# CORS Policy relaxada para dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Módulos (Domain Isolation)
app.include_router(sitemap_router)

# Registro de Autenticação Global Core
from app.core.auth import router as auth_router
app.include_router(auth_router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Sarak API is running"}

def main():
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()

