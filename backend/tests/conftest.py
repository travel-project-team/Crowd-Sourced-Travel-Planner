# Shared pytest fixtures for the backend tests
# test_db: in memory mongomock database swapped into config.db
# client: FastAPI TestClient that calls routes in-process
# make_user: inserts a user and mints a real JWT for them
# default_user: a registered user with token and auth cookie

import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("MONGODB_URL", "mongodb://localhost:27017/unused-in-tests")
from datetime import datetime, timezone
import mongomock
import pytest
from fastapi.testclient import TestClient
from src import config
from src.main import app
from src.utility.authentication import create_access_token, hash_password

@pytest.fixture()
def test_db(monkeypatch):
    """Swap config.db for an in-memory mongomock database."""
    mock_client = mongomock.MongoClient()
    monkeypatch.setattr(config, "db", mock_client.travel_planner_test)
    return config.db

@pytest.fixture()
def client(test_db):
    return TestClient(app)

@pytest.fixture()
def make_user(test_db):
    def _make_user(
        username: str = "billbill123",
        email: str = "billie.billerson@example.com",
        password: str = "hunter2!",
        first_name: str = "Billie",
        last_name: str = "Billerson",
    ):
        result = test_db.users.insert_one(
            {
                "first_name": first_name,
                "last_name": last_name,
                "username": username,
                "email": email,
                "password_hash": hash_password(password),
                "avatar_url": None,
                "created_at": datetime.now(timezone.utc),
            }
        )
        user_id = str(result.inserted_id)
        token = create_access_token({"sub": email, "user_id": user_id})
        return {
            "id": user_id,
            "username": username,
            "email": email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "token": token,
            "cookies": {"access_token": token},
        }

    return _make_user

@pytest.fixture()
def default_user(make_user):
    """A single pre-registered user for tests that just need someone logged in."""
    return make_user()