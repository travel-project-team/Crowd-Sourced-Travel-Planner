# Port listener and backend entry point 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn, os
from contextlib import asynccontextmanager

from src.config import initialize_services, close_services
from src.routes.trips import router as trips_router
from src.routes.users import router as users_router
from src.routes.experiences import router as experiences_router

# FastAPI lifecycle - External services
@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_services()

    yield
    close_services()

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:9000",
    "http://127.0.0.1:9000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials = True,
    allow_methods= ["*"],
    allow_headers= ["*"],
)

# Router registration
app.include_router(trips_router)
app.include_router(users_router)
app.include_router(experiences_router)

# Production - Handles frontend as static file
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def frontend(full_path: str):
        return FileResponse("static/index.html")

# Development - Hot reloading server
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)