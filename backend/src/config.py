# Handles connections to external services

import os
import logging
import cloudinary
from dotenv import load_dotenv
from pymongo import MongoClient

# Load .env file for environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
CLOUDINARY_NAME = os.getenv("CLOUDINARY_NAME")
CLOUDINARY_KEY = os.getenv("CLOUDINARY_KEY")
CLOUDINARY_SECRET = os.getenv("CLOUDINARY_SECRET")

logger = logging.getLogger("uvicorn.error")

client = None
db = None

# Connection manager -called in main.py
def initialize_services():
    global client, db
    try:
        # MongoDB 
        client = MongoClient(MONGODB_URL)
        client.admin.command('ping') # Database connection test
        db = client.travel_planner
        logger.info("Connected to MongoDB successfully!")

        # Cloudinary
        cloudinary.config(
            cloud_name=CLOUDINARY_NAME,
            api_key=CLOUDINARY_KEY,
            api_secret=CLOUDINARY_SECRET,
            secure=True
        )
        logger.info("Cloudinary configurations are ready!")

    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {str(e)}")

def close_services():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")