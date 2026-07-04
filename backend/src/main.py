# Port listener and entry point 

from fastapi import FastAPI
import uvicorn
from routes.trips import router as trips_router
from routes.users import router as users_router
from routes.experiences import router as experiences_router

app = FastAPI()

# Router registration
app.include_router(trips_router)
app.include_router(users_router)
app.include_router(experiences_router)

# Connection test. 
@app.get("/api/test")
def api_test():
    return {"status": "success", "message": "Backend connection via proxy"}

if __name__ == "__main__":
    # Enable hot reloading development server
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)