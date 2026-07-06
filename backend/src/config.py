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

# Connection manager -called in main.py
def connect_db():
    global client, db
    try:
        client = MongoClient(MONGODB_URL)

        # Database connection test
        client.admin.command('ping')

        # Select database from MongoDB cluster
        db = client.travel_planner
        
        # Logs connection status to console
        logger.info("Connected to MongoDB successfully!")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {str(e)}")

def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")