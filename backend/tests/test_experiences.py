# Tests for experiences routes (src/routes/experiences.py)
# List & Search: filters, pagination, sorting, X-Total-Count header
# CRUD: create/read/update/delete with ownership checks
# Ratings: bounds validation, self-rating rejection, average calc
# Image Upload: content-type validation (Cloudinary mocked)

import pytest

def experience_body(**overrides):
    body = {
        "user_id": "ignored-client-value",  # server must overwrite from token
        "title": "Canoeing underwater",
        "description": "Took a canoe to Atlantis",
        "location_name": "Atlantis",
        "location_geojson": {"type": "Point", "coordinates": [-80.191788, 25.761681]},
        "keywords": ["adventure", "water", "canoeing"],
    }
    body.update(overrides)
    return body

@pytest.fixture()
def create_experience(client):
    """Create an experience through the API as a given user; returns its id."""

    def _create(user, **overrides):
        response = client.post(
            "/api/experiences", json=experience_body(**overrides), cookies=user["cookies"]
        )
        assert response.status_code == 201
        return response.json()["id"]

    return _create

# List & Search
class TestListAndSearch:
    def test_empty_list(self, client, test_db):
        response = client.get("/api/experiences")
        assert response.status_code == 200
        assert response.json() == []
        assert response.headers["X-Total-Count"] == "0"

    def test_keyword_matches_title_description_and_keywords(
        self, client, default_user, create_experience
    ):
        create_experience(default_user, title="Kayak trip", description="x", keywords=[])
        create_experience(default_user, title="y", description="Great kayaking spot", keywords=[])
        create_experience(default_user, title="z", description="x", keywords=["kayak"])
        create_experience(default_user, title="Museum visit", description="art", keywords=["indoor"])
        response = client.get("/api/experiences", params={"keyword": "KAYAK"})
        assert response.status_code == 200
        assert len(response.json()) == 3  # case-insensitive, all three fields

    def test_location_filter(self, client, default_user, create_experience):
        create_experience(default_user, location_name="Portland, Oregon")
        create_experience(default_user, location_name="Seattle, Washington")
        response = client.get("/api/experiences", params={"location": "portland"})
        assert len(response.json()) == 1
        assert response.json()[0]["location_name"] == "Portland, Oregon"

    def test_pagination_and_total_count(self, client, default_user, create_experience):
        for i in range(5):
            create_experience(default_user, title=f"Experience {i}")
        response = client.get("/api/experiences", params={"limit": 2, "skip": 2})
        assert len(response.json()) == 2
        # Header reflects the total match count, not the page size
        assert response.headers["X-Total-Count"] == "5"

    def test_sort_by_title_ascending(self, client, default_user, create_experience):
        for title in ["Banana", "Apple", "Cherry"]:
            create_experience(default_user, title=title)
        response = client.get(
            "/api/experiences", params={"sort": "title", "order": "asc"}
        )
        titles = [exp["title"] for exp in response.json()]
        assert titles == ["Apple", "Banana", "Cherry"]

    def test_invalid_sort_field(self, client, test_db):
        response = client.get("/api/experiences", params={"sort": "password_hash"})
        assert response.status_code == 400

    def test_invalid_order(self, client, test_db):
        response = client.get("/api/experiences", params={"order": "sideways"})
        assert response.status_code == 400

# Crud & ownership 
class TestGetSingle:
    def test_get_by_id(self, client, default_user, create_experience):
        experience_id = create_experience(default_user, title="Find me")
        response = client.get(f"/api/experiences/{experience_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Find me"

    def test_get_unknown_id(self, client, test_db):
        response = client.get("/api/experiences/0123456789abcdef01234567")
        assert response.status_code == 404

    def test_get_invalid_id_format(self, client, test_db):
        response = client.get("/api/experiences/not-an-objectid")
        assert response.status_code == 400

class TestCreate:
    def test_create_requires_auth(self, client, test_db):
        response = client.post("/api/experiences", json=experience_body())
        assert response.status_code in (401, 403)

    def test_create_sets_user_id_from_token(
        self, client, default_user, create_experience
    ):
        """The client-supplied user_id must be overwritten by the token's user."""
        experience_id = create_experience(default_user, user_id="someone-else")
        saved = client.get(f"/api/experiences/{experience_id}").json()
        assert saved["user_id"] == default_user["id"]

class TestUpdate:
    def test_owner_can_update(self, client, default_user, create_experience):
        experience_id = create_experience(default_user)
        response = client.put(
            f"/api/experiences/{experience_id}",
            json={"title": "Updated title"},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200
        assert client.get(f"/api/experiences/{experience_id}").json()["title"] == "Updated title"

    def test_non_owner_cannot_update(self, client, make_user, create_experience):
        owner = make_user()
        stranger = make_user(username="stranger", email="stranger@example.com")
        experience_id = create_experience(owner)

        response = client.put(
            f"/api/experiences/{experience_id}",
            json={"title": "Hijacked"},
            cookies=stranger["cookies"],
        )
        assert response.status_code == 403

    def test_update_with_no_fields(self, client, default_user, create_experience):
        experience_id = create_experience(default_user)
        response = client.put(
            f"/api/experiences/{experience_id}", json={}, cookies=default_user["cookies"]
        )
        assert response.status_code == 400

    def test_update_unknown_id(self, client, default_user):
        response = client.put(
            "/api/experiences/0123456789abcdef01234567",
            json={"title": "x"},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 404

class TestDelete:
    def test_owner_can_delete(self, client, default_user, create_experience, test_db):
        experience_id = create_experience(default_user)
        response = client.delete(
            f"/api/experiences/{experience_id}", cookies=default_user["cookies"]
        )
        assert response.status_code == 200
        assert client.get(f"/api/experiences/{experience_id}").status_code == 404

    def test_non_owner_cannot_delete(self, client, make_user, create_experience):
        owner = make_user()
        stranger = make_user(username="stranger", email="stranger@example.com")
        experience_id = create_experience(owner)

        response = client.delete(
            f"/api/experiences/{experience_id}", cookies=stranger["cookies"]
        )
        assert response.status_code == 403

# Ratings 
class TestRatings:
    def test_rate_experience_and_average(self, client, make_user, create_experience):
        owner = make_user()
        rater_one = make_user(username="rater1", email="rater1@example.com")
        rater_two = make_user(username="rater2", email="rater2@example.com")
        experience_id = create_experience(owner)

        first = client.post(
            f"/api/experiences/{experience_id}/ratings",
            json={"rating": 5},
            cookies=rater_one["cookies"],
        )
        assert first.status_code == 201
        assert first.json()["average_rating"] == 5.0
        assert first.json()["rating_count"] == 1

        second = client.post(
            f"/api/experiences/{experience_id}/ratings",
            json={"rating": 4},
            cookies=rater_two["cookies"],
        )
        assert second.json()["average_rating"] == 4.5
        assert second.json()["rating_count"] == 2

    def test_cannot_rate_own_experience(self, client, default_user, create_experience):
        experience_id = create_experience(default_user)
        response = client.post(
            f"/api/experiences/{experience_id}/ratings",
            json={"rating": 5},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 403

    @pytest.mark.parametrize("bad_rating", [0, 6, -1])
    def test_rating_bounds_enforced(
        self, client, make_user, create_experience, bad_rating
    ):
        owner = make_user()
        rater = make_user(username="rater", email="rater@example.com")
        experience_id = create_experience(owner)

        response = client.post(
            f"/api/experiences/{experience_id}/ratings",
            json={"rating": bad_rating},
            cookies=rater["cookies"],
        )
        assert response.status_code == 422

    def test_rate_unknown_experience(self, client, default_user):
        response = client.post(
            "/api/experiences/0123456789abcdef01234567/ratings",
            json={"rating": 3},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 404

# Image Upload 
@pytest.fixture()
def mock_cloudinary(monkeypatch):
    """Stub the Cloudinary upload so tests never hit the network."""
    fake_url = "https://res.cloudinary.com/test/image/upload/fake-image.png"
    async def fake_upload(file, folder_name=None):
        return fake_url
    monkeypatch.setattr("src.routes.experiences.cloudinary_upload", fake_upload)
    return fake_url

class TestImageUpload:
    def test_upload_image(self, client, default_user, mock_cloudinary):
        response = client.post(
            "/api/experiences/image",
            files={"file": ("photo.png", b"fake-image-bytes", "image/png")},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200
        assert response.json()["image_url"] == mock_cloudinary

    def test_non_image_rejected(self, client, default_user, mock_cloudinary):
        response = client.post(
            "/api/experiences/image",
            files={"file": ("notes.txt", b"just text", "text/plain")},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 400

    def test_upload_requires_auth(self, client, test_db, mock_cloudinary):
        response = client.post(
            "/api/experiences/image",
            files={"file": ("photo.png", b"fake-image-bytes", "image/png")},
        )
        assert response.status_code in (401, 403)