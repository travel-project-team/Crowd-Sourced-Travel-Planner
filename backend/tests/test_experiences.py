"""Tests for the experiences routes (src/routes/experiences.py).

Covers:
    List & Search: filters, pagination, sorting, X-Total-Count header
    CRUD: create/read/update/delete with ownership checks
    Ratings: bounds validation, self-rating rejection, average calc
    Image Upload: content-type validation (Cloudinary mocked)
"""

import pytest

def experience_body(**overrides):
    """Return a valid experience payload, with any field replaced by overrides."""
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
    """GET /api/experiences — filtering, pagination, and sorting."""

    def test_empty_list(self, client, test_db):
        """An empty collection returns [] and a zero total count."""
        response = client.get("/api/experiences")
        assert response.status_code == 200
        assert response.json() == []
        assert response.headers["X-Total-Count"] == "0"

    def test_keyword_matches_title_description_and_keywords(
        self, client, default_user, create_experience
    ):
        """A keyword search spans title, description, and keywords, case-insensitively."""
        create_experience(default_user, title="Kayak trip", description="x", keywords=[])
        create_experience(default_user, title="y", description="Great kayaking spot", keywords=[])
        create_experience(default_user, title="z", description="x", keywords=["kayak"])
        create_experience(default_user, title="Museum visit", description="art", keywords=["indoor"])
        response = client.get("/api/experiences", params={"keyword": "KAYAK"})
        assert response.status_code == 200
        assert len(response.json()) == 3  # case-insensitive, all three fields

    def test_location_filter(self, client, default_user, create_experience):
        """The location filter matches location_name as a case-insensitive substring."""
        create_experience(default_user, location_name="Portland, Oregon")
        create_experience(default_user, location_name="Seattle, Washington")
        response = client.get("/api/experiences", params={"location": "portland"})
        assert len(response.json()) == 1
        assert response.json()[0]["location_name"] == "Portland, Oregon"

    def test_pagination_and_total_count(self, client, default_user, create_experience):
        """limit/skip page the results while X-Total-Count reports the full match count."""
        for i in range(5):
            create_experience(default_user, title=f"Experience {i}")
        response = client.get("/api/experiences", params={"limit": 2, "skip": 2})
        assert len(response.json()) == 2
        # Header reflects the total match count, not the page size
        assert response.headers["X-Total-Count"] == "5"

    def test_sort_by_title_ascending(self, client, default_user, create_experience):
        """sort=title with order=asc returns titles in alphabetical order."""
        for title in ["Banana", "Apple", "Cherry"]:
            create_experience(default_user, title=title)
        response = client.get(
            "/api/experiences", params={"sort": "title", "order": "asc"}
        )
        titles = [exp["title"] for exp in response.json()]
        assert titles == ["Apple", "Banana", "Cherry"]

    def test_invalid_sort_field(self, client, test_db):
        """Sorting is restricted to an allowlist, so unlisted fields are rejected."""
        response = client.get("/api/experiences", params={"sort": "password_hash"})
        assert response.status_code == 400

    def test_invalid_order(self, client, test_db):
        """An order other than asc/desc is rejected."""
        response = client.get("/api/experiences", params={"order": "sideways"})
        assert response.status_code == 400

# Crud & ownership 
class TestGetSingle:
    """GET /api/experiences/{id} — lookup by id and id validation."""

    def test_get_by_id(self, client, default_user, create_experience):
        """A known id returns the matching experience."""
        experience_id = create_experience(default_user, title="Find me")
        response = client.get(f"/api/experiences/{experience_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Find me"

    def test_get_unknown_id(self, client, test_db):
        """A well-formed id with no matching document returns 404."""
        response = client.get("/api/experiences/0123456789abcdef01234567")
        assert response.status_code == 404

    def test_get_invalid_id_format(self, client, test_db):
        """A string that isn't a valid ObjectId returns 400, not 404 or 500."""
        response = client.get("/api/experiences/not-an-objectid")
        assert response.status_code == 400

class TestCreate:
    """POST /api/experiences — auth requirement and server-assigned ownership."""

    def test_create_requires_auth(self, client, test_db):
        """Creating without an auth cookie is rejected."""
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
    """PUT /api/experiences/{id} — ownership checks and payload validation."""

    def test_owner_can_update(self, client, default_user, create_experience):
        """The owner can update their own experience and the change persists."""
        experience_id = create_experience(default_user)
        response = client.put(
            f"/api/experiences/{experience_id}",
            json={"title": "Updated title"},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200
        assert client.get(f"/api/experiences/{experience_id}").json()["title"] == "Updated title"

    def test_non_owner_cannot_update(self, client, make_user, create_experience):
        """An authenticated non-owner gets 403 rather than modifying the record."""
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
        """An empty update body is rejected instead of being treated as a no-op."""
        experience_id = create_experience(default_user)
        response = client.put(
            f"/api/experiences/{experience_id}", json={}, cookies=default_user["cookies"]
        )
        assert response.status_code == 400

    def test_update_unknown_id(self, client, default_user):
        """Updating an id that doesn't exist returns 404."""
        response = client.put(
            "/api/experiences/0123456789abcdef01234567",
            json={"title": "x"},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 404

class TestDelete:
    """DELETE /api/experiences/{id} — ownership checks."""

    def test_owner_can_delete(self, client, default_user, create_experience, test_db):
        """The owner can delete their experience, after which it is no longer retrievable."""
        experience_id = create_experience(default_user)
        response = client.delete(
            f"/api/experiences/{experience_id}", cookies=default_user["cookies"]
        )
        assert response.status_code == 200
        assert client.get(f"/api/experiences/{experience_id}").status_code == 404

    def test_non_owner_cannot_delete(self, client, make_user, create_experience):
        """An authenticated non-owner gets 403 rather than deleting the record."""
        owner = make_user()
        stranger = make_user(username="stranger", email="stranger@example.com")
        experience_id = create_experience(owner)

        response = client.delete(
            f"/api/experiences/{experience_id}", cookies=stranger["cookies"]
        )
        assert response.status_code == 403

# Ratings 
class TestRatings:
    """POST /api/experiences/{id}/ratings — average calculation and validation."""

    def test_rate_experience_and_average(self, client, make_user, create_experience):
        """Each rating updates the running average and count."""
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
        """Users can't inflate their own experience's rating."""
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
        """Ratings outside 1-5 fail schema validation."""
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
        """Rating an experience that doesn't exist returns 404."""
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
    """POST /api/experiences/image — content-type validation with Cloudinary mocked."""

    def test_upload_image(self, client, default_user, mock_cloudinary):
        """A valid image upload returns the hosted image URL."""
        response = client.post(
            "/api/experiences/image",
            files={"file": ("photo.png", b"fake-image-bytes", "image/png")},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 200
        assert response.json()["image_url"] == mock_cloudinary

    def test_non_image_rejected(self, client, default_user, mock_cloudinary):
        """A non-image content type is rejected before reaching Cloudinary."""
        response = client.post(
            "/api/experiences/image",
            files={"file": ("notes.txt", b"just text", "text/plain")},
            cookies=default_user["cookies"],
        )
        assert response.status_code == 400

    def test_upload_requires_auth(self, client, test_db, mock_cloudinary):
        """Uploading without an auth cookie is rejected."""
        response = client.post(
            "/api/experiences/image",
            files={"file": ("photo.png", b"fake-image-bytes", "image/png")},
        )
        assert response.status_code in (401, 403)