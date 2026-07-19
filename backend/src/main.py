# Port listener and backend entry point 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
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

# CORS configuration --Currently bypassed by Vite Proxy in development 
# Keep for production deployment
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

# Server connection test. ---Remove after development
@app.get("/api/server-health")
def api_test():
    return {"status": "SUCCESS", "message": "Backend connected successfully!"}

if __name__ == "__main__":
    # Enable hot reloading development server
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)