import pytest

REGISTER_BODY = {
    "first_name": "Billie",
    "last_name": "Billerson",
    "username": "billbill123",
    "email": "billie.billerson@example.com",
    "password": "hunter2!",
}

# AUTH: registration & login 
class TestRegistration:
    def test_register_success(self, client, test_db):
        response = client.post("/api/users", json=REGISTER_BODY)
        assert response.status_code == 201
        saved = test_db.users.find_one({"email": REGISTER_BODY["email"]})
        assert saved is not None
        assert saved["username"] == REGISTER_BODY["username"]
        assert saved["password_hash"] != REGISTER_BODY["password"]

    def test_register_duplicate_email(self, client, default_user):
        body = dict(REGISTER_BODY, username="different_username")
        response = client.post("/api/users", json=body)
        assert response.status_code == 400
        assert response.json()["detail"] == "Email already registered"

    def test_register_duplicate_username(self, client, default_user):
        body = dict(REGISTER_BODY, email="other@example.com")
        response = client.post("/api/users", json=body)
        assert response.status_code == 400
        assert response.json()["detail"] == "Username already taken"

    def test_register_invalid_email_rejected(self, client, test_db):
        body = dict(REGISTER_BODY, email="not-an-email")
        response = client.post("/api/users", json=body)
        assert response.status_code == 422

class TestLogin:
    def test_login_success_sets_auth_cookie(self, client, default_user):
        response = client.post(
            "/api/users/login",
            json={"email": default_user["email"], "password": default_user["password"]},
        )
        assert response.status_code == 200
        # Token now travels in an HTTP-only cookie, not the response body
        assert "access_token" in response.cookies
        assert "access_token" not in response.json()

    def test_login_cookie_round_trip(self, client, default_user):
        """The cookie set by login must be accepted by a protected route.

        The TestClient keeps a cookie jar like a browser, so after login
        the next request authenticates automatically."""
        client.post(
            "/api/users/login",
            json={"email": default_user["email"], "password": default_user["password"]},
        )
        profile = client.get("/api/users")
        assert profile.status_code == 200
        assert profile.json()["email"] == default_user["email"]

    def test_logout_clears_auth_cookie(self, client, default_user):
        client.post(
            "/api/users/login",
            json={"email": default_user["email"], "password": default_user["password"]},
        )
        assert client.get("/api/users").status_code == 200

        response = client.post("/api/users/logout")
        assert response.status_code == 200

        # Cookie is cleared, so the session no longer authenticates
        assert client.get("/api/users").status_code == 401

    def test_login_wrong_password(self, client, default_user):
        response = client.post(
            "/api/users/login",
            json={"email": default_user["email"], "password": "wrong-password"},
        )
        assert response.status_code == 401

    def test_login_unknown_email(self, client, test_db):
        response = client.post(
            "/api/users/login",
            json={"email": "ghost@example.com", "password": "whatever"},
        )
        assert response.status_code == 401

class TestTokenValidation:
    def test_missing_cookie_rejected(self, client, test_db):
        response = client.get("/api/users")
        assert response.status_code == 401

    def test_garbage_token_rejected(self, client, test_db):
        response = client.get(
            "/api/users", cookies={"access_token": "not.a.real.jwt"}
        )
        assert response.status_code == 401

    def test_token_for_deleted_user_rejected(self, client, default_user):
        """A valid token whose user no longer exists must fail verify_user."""
        client.delete("/api/users", cookies=default_user["cookies"])
        response = client.get("/api/users", cookies=default_user["cookies"])
        assert response.status_code == 401

# PROFILE: GET / PUT / DELETE /api/users 
class TestProfile:
    def test_get_profile(self, client, default_user):
        response = client.get("/api/users", cookies=default_user["cookies"])
        assert response.status_code == 200
        body = response.json()
        assert body["email"] == default_user["email"]
        assert body["username"] == default_user["username"]
        assert body["_id"] == default_user["id"]
        assert "password_hash" not in body

    def test_update_profile_fields(self, client, default_user):
        response = client.put(
            "/api/users",
            json={"first_name": "Updated", "username": "new_username"},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200
        profile = client.get("/api/users", cookies=default_user["cookies"]).json()
        assert profile["first_name"] == "Updated"
        assert profile["username"] == "new_username"

    def test_update_with_no_fields(self, client, default_user):
        response = client.put("/api/users", json={}, cookies=default_user["cookies"])
        assert response.status_code == 400

    def test_update_to_taken_email(self, client, make_user):
        first = make_user()
        second = make_user(username="second_user", email="second@example.com")
        response = client.put(
            "/api/users",
            json={"email": first["email"]},
            cookies=second["cookies"],
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Email already registered"

    def test_update_to_own_email_is_allowed(self, client, default_user):
        """Re-submitting your own email must not trip the duplicate check."""
        response = client.put(
            "/api/users",
            json={"email": default_user["email"]},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200

    def test_profile_update_cannot_change_password(self, client, default_user):
        """Password changes moved to PUT /password; the profile route ignores it."""
        response = client.put(
            "/api/users",
            json={"password": "sneaky-password"},
            cookies=default_user["cookies"],
        )
        # Unknown field is ignored -> no updatable fields provided
        assert response.status_code == 400

class TestPasswordChange:
    """PUT /api/users/password requires the current password."""
    def test_password_change_allows_new_login(self, client, default_user):
        response = client.put(
            "/api/users/password",
            json={
                "current_password": default_user["password"],
                "new_password": "brand-new-password",
            },
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200
        old = client.post(
            "/api/users/login",
            json={"email": default_user["email"], "password": default_user["password"]},
        )
        assert old.status_code == 401
        new = client.post(
            "/api/users/login",
            json={"email": default_user["email"], "password": "brand-new-password"},
        )
        assert new.status_code == 200

    def test_wrong_current_password_rejected(self, client, default_user):
        response = client.put(
            "/api/users/password",
            json={"current_password": "wrong", "new_password": "brand-new-password"},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 400

    def test_short_new_password_rejected(self, client, default_user):
        """UsersPassword enforces a 6-character minimum."""
        response = client.put(
            "/api/users/password",
            json={"current_password": default_user["password"], "new_password": "abc"},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 422

    def test_delete_user(self, client, default_user, test_db):
        response = client.delete("/api/users", cookies=default_user["cookies"])
        assert response.status_code == 200
        assert test_db.users.find_one({"email": default_user["email"]}) is None

# BATCH LOOKUP: POST /api/users/id and /api/users/email 
class TestBatchLookup:
    def test_batch_by_id_preserves_request_order(self, client, make_user):
        alice = make_user(username="alice", email="alice@example.com")
        bob = make_user(username="bob", email="bob@example.com")
        response = client.post(
            "/api/users/id",
            json={"user_ids": [bob["id"], alice["id"]]},
            cookies=alice["cookies"],
        )
        assert response.status_code == 200
        usernames = [profile["username"] for profile in response.json()]
        assert usernames == ["bob", "alice"]

    def test_batch_by_id_skips_unknown_ids(self, client, make_user):
        alice = make_user(username="alice", email="alice@example.com")
        unknown = "0123456789abcdef01234567"
        response = client.post(
            "/api/users/id",
            json={"user_ids": [alice["id"], unknown]},
            cookies=alice["cookies"],
        )
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_batch_by_id_invalid_format(self, client, default_user):
        response = client.post(
            "/api/users/id",
            json={"user_ids": ["not-an-objectid"]},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 400

    def test_batch_requires_auth(self, client, test_db):
        response = client.post("/api/users/id", json={"user_ids": []})
        assert response.status_code == 401

    def test_batch_by_email(self, client, make_user):
        alice = make_user(username="alice", email="alice@example.com")
        make_user(username="bob", email="bob@example.com")
        response = client.post(
            "/api/users/email",
            json={"emails": [alice["email"]]},
            cookies=alice["cookies"],
        )
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        assert body[0]["username"] == "alice"

    def test_batch_profiles_do_not_leak_password_hash(self, client, make_user):
        alice = make_user(username="alice", email="alice@example.com")
        response = client.post(
            "/api/users/id",
            json={"user_ids": [alice["id"]]},
            cookies=alice["cookies"],
        )
        assert "password_hash" not in response.json()[0]

# AVATAR: POST / DELETE /api/users/avatar
@pytest.fixture()
def mock_cloudinary(monkeypatch):
    """This just replace the Cloudinary upload with a stub so tests never hit the network."""
    fake_url = "https://res.cloudinary.com/test/image/upload/fake-avatar.png"
    async def fake_upload(file, folder_name=None):
        return fake_url
    monkeypatch.setattr("src.routes.users.cloudinary_upload", fake_upload)
    return fake_url

class TestAvatar:
    def test_upload_avatar(self, client, default_user, mock_cloudinary):
        response = client.post(
            "/api/users/avatar",
            files={"file": ("avatar.png", b"fake-image-bytes", "image/png")},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200
        assert response.json()["avatar_url"] == mock_cloudinary
        profile = client.get("/api/users", cookies=default_user["cookies"]).json()
        assert profile["avatar_url"] == mock_cloudinary

    def test_remove_avatar(self, client, default_user, mock_cloudinary):
        client.post(
            "/api/users/avatar",
            files={"file": ("avatar.png", b"fake-image-bytes", "image/png")},
            cookies=default_user["cookies"],
        )
        response = client.delete("/api/users/avatar", cookies=default_user["cookies"])
        assert response.status_code == 200
        profile = client.get("/api/users", cookies=default_user["cookies"]).json()
        assert profile["avatar_url"] is None

    def test_avatar_requires_auth(self, client, test_db, mock_cloudinary):
        response = client.post(
            "/api/users/avatar",
            files={"file": ("avatar.png", b"fake-image-bytes", "image/png")},
        )
        assert response.status_code in (401, 403)

# CASCADE DELETE: AI Enhanced Using Claude
class TestCascadeDelete:
    def test_delete_removes_owned_experiences(self, client, make_user, test_db):
        user = make_user()
        client.post(
            "/api/experiences",
            json={
                "user_id": "ignored",
                "title": "Orphan candidate",
                "location_name": "Somewhere",
                "location_geojson": {"type": "Point", "coordinates": [0.0, 0.0]},
            },
            cookies=user["cookies"],
        )
        client.delete("/api/users", cookies=user["cookies"])
        assert test_db.experiences.count_documents({"user_id": user["id"]}) == 0

    def test_delete_removes_owned_trips(self, client, make_user, test_db):
        user = make_user()
        client.post(
            "/api/trips",
            json={"trip_name": "Doomed trip", "owner_id": "ignored"},
            cookies=user["cookies"],
        )
        client.delete("/api/users", cookies=user["cookies"])
        assert test_db.trips.count_documents({"owner_id": user["id"]}) == 0

    def test_delete_removes_collaborator_entries(self, client, make_user, test_db):
        owner = make_user()
        collaborator = make_user(username="collab", email="collab@example.com")
        response = client.post(
            "/api/trips",
            json={
                "trip_name": "Shared trip",
                "owner_id": "ignored",
                "collaborator_ids": [collaborator["id"]],
            },
            cookies=owner["cookies"],
        )
        trip_id = response.json()["id"]
        client.delete("/api/users", cookies=collaborator["cookies"])
        saved = client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).json()
        assert collaborator["id"] not in saved["collaborator_ids"]

    def test_delete_unlinks_experiences_from_other_users_trips(
        self, client, make_user, test_db
    ):
        experience_owner = make_user()
        trip_owner = make_user(username="tripper", email="tripper@example.com")
        exp_response = client.post(
            "/api/experiences",
            json={
                "user_id": "ignored",
                "title": "Linked elsewhere",
                "location_name": "Somewhere",
                "location_geojson": {"type": "Point", "coordinates": [0.0, 0.0]},
            },
            cookies=experience_owner["cookies"],
        )
        experience_id = exp_response.json()["id"]
        trip_response = client.post(
            "/api/trips",
            json={"trip_name": "Other user's trip", "owner_id": "ignored"},
            cookies=trip_owner["cookies"],
        )
        trip_id = trip_response.json()["id"]
        client.post(
            f"/api/trips/{trip_id}/experiences/{experience_id}",
            cookies=trip_owner["cookies"],
        )
        client.delete("/api/users", cookies=experience_owner["cookies"])
        saved = client.get(f"/api/trips/{trip_id}", cookies=trip_owner["cookies"]).json()
        assert experience_id not in saved["experience_ids"]