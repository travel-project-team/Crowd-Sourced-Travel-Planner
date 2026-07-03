# Database connection via PyMongo

import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env 
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
SECRET_KEY = os.getenv("SECRET_KEY")

# Initialize MongoDB Client
######### Temporary database name = 'travel_planner'. Change as needed. #########
client = MongoClient(MONGODB_URL)
db = client.travel_planner