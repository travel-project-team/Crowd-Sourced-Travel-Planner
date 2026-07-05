# Database connection via PyMongo

import os
import logging
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env 
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
SECRET_KEY = os.getenv("SECRET_KEY")

logger = logging.getLogger("uvicorn.error")

client = None
db = None

# Called in main.py
def connect_db():
    global client, db
    try:
        client = MongoClient(MONGODB_URL)
        db = client.travel_planner
        logger.info("Connected to MongoDB successfully!")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {str(e)}")

def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")