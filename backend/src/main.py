# Port listener

from fastapi import FastAPI
import uvicorn

app = FastAPI()

# API endpoints

# Test endpoint. Remove later
@app.get("/")
def read_api_test():
    return {"status": "success", "message": "Backend connection via proxy"}

if __name__ == "__main__":
    # Hot reloading development server
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)