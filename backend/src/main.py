# Port listener

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

# API endpoints

# Test endpoint. Remove later
@app.get("/")
def read_api_test():
    return {"status": "success", "message": "Backend connection via proxy"}

if __name__ == "__main__":
    import uvicorn
    # Hot reloading development server
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)