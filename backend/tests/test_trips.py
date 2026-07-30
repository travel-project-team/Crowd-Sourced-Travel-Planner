"""Tests for the trips routes (src/routes/trips.py).

Covers:
    CRUD: create/read/update/delete
    Two-tier permissions: owner vs collaborator vs outsider on every route
    Trip-experience linking: POST/DELETE /{trip_id}/experiences/{experience_id}

Permission tiers:
    Tier 1 (owner or collaborator): view, update, link/unlink experiences
    Tier 2 (owner only): delete
"""

import pytest

def trip_body(owner_id="ignored-client-value", **overrides):
    """Return a valid trip payload, with any field replaced by overrides."""
    body = {
        "trip_name": "South Africa",
        "trip_description": "Went to S Africa for a couple weeks.",
        "owner_id": owner_id,
        "collaborator_ids": [],
        "experience_ids": [],
    }
    body.update(overrides)
    return body

@pytest.fixture()
def three_users(make_user):
    """Create one user per permission tier: owner, collaborator, and outsider."""
    owner = make_user(username="owner", email="owner@example.com")
    collaborator = make_user(username="collab", email="collab@example.com")
    outsider = make_user(username="outsider", email="outsider@example.com")
    return owner, collaborator, outsider

@pytest.fixture()
def shared_trip(client, three_users):
    """A trip owned by `owner` with `collaborator` on it; returns (trip_id, users)."""
    owner, collaborator, outsider = three_users
    response = client.post(
        "/api/trips",
        json=trip_body(collaborator_ids=[collaborator["id"]]),
        cookies=owner["cookies"],
    )
    assert response.status_code == 201
    return response.json()["id"], owner, collaborator, outsider

# Crud
class TestCreate:
    """POST /api/trips — auth requirement and server-assigned ownership."""

    def test_create_requires_auth(self, client, test_db):
        """Creating without an auth cookie is rejected."""
        response = client.post("/api/trips", json=trip_body())
        assert response.status_code in (401, 403)

    def test_create_sets_owner_from_token(self, client, default_user):
        """The client-supplied owner_id must be overwritten by the token's user."""
        response = client.post(
            "/api/trips", json=trip_body(owner_id="someone-else"),
            cookies=default_user["cookies"],
        )
        assert response.status_code == 201
        trip_id = response.json()["id"]
        saved = client.get(f"/api/trips/{trip_id}", cookies=default_user["cookies"]).json()
        assert saved["owner_id"] == default_user["id"]

class TestListTrips:
    """GET /api/trips — scoping to the caller's trips, plus sort validation."""

    def test_list_shows_owned_and_shared_only(self, client, shared_trip):
        """Owners and collaborators see the trip; outsiders get an empty list."""
        trip_id, owner, collaborator, outsider = shared_trip
        owner_trips = client.get("/api/trips", cookies=owner["cookies"]).json()
        assert [trip["_id"] for trip in owner_trips] == [trip_id]
        collab_trips = client.get("/api/trips", cookies=collaborator["cookies"]).json()
        assert [trip["_id"] for trip in collab_trips] == [trip_id]
        outsider_trips = client.get("/api/trips", cookies=outsider["cookies"]).json()
        assert outsider_trips == []

    def test_list_invalid_sort_field(self, client, default_user):
        """Sorting is restricted to an allowlist, so unlisted fields are rejected."""
        response = client.get(
            "/api/trips", params={"sort": "owner_id"}, cookies=default_user["cookies"]
        )
        assert response.status_code == 400

    def test_list_invalid_order(self, client, default_user):
        """An order other than asc/desc is rejected."""
        response = client.get(
            "/api/trips", params={"order": "sideways"}, cookies=default_user["cookies"]
        )
        assert response.status_code == 400

class TestGetSingle:
    """GET /api/trips/{id} — tier 1 read access and id validation."""

    def test_owner_and_collaborator_can_view_outsider_cannot(self, client, shared_trip):
        """Tier 1: viewing is shared between owner and collaborator only."""
        trip_id, owner, collaborator, outsider = shared_trip
        assert client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).status_code == 200
        assert client.get(f"/api/trips/{trip_id}", cookies=collaborator["cookies"]).status_code == 200
        assert client.get(f"/api/trips/{trip_id}", cookies=outsider["cookies"]).status_code == 403

    def test_get_unknown_trip(self, client, default_user):
        """A well-formed id with no matching document returns 404."""
        response = client.get(
            "/api/trips/0123456789abcdef01234567", cookies=default_user["cookies"]
        )
        assert response.status_code == 404

    def test_get_invalid_id_format(self, client, default_user):
        """A string that isn't a valid ObjectId returns 400, not 404 or 500."""
        response = client.get("/api/trips/not-an-objectid", cookies=default_user["cookies"])
        assert response.status_code == 400

# two tier permission: update (tier 1) vs delete (tier 2)
class TestUpdatePermissions:
    """PUT /api/trips/{id} — tier 1 write access and protected fields."""

    def test_owner_can_update(self, client, shared_trip):
        """The owner may update the trip."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.put(
            f"/api/trips/{trip_id}",
            json={"trip_name": "Renamed by owner"},
            cookies=owner["cookies"],
        )
        assert response.status_code == 200

    def test_collaborator_can_update(self, client, shared_trip):
        """Tier 1: collaborators share edit access."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.put(
            f"/api/trips/{trip_id}",
            json={"trip_name": "Renamed by collaborator"},
            cookies=collaborator["cookies"],
        )
        assert response.status_code == 200

        saved = client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).json()
        assert saved["trip_name"] == "Renamed by collaborator"

    def test_outsider_cannot_update(self, client, shared_trip):
        """A user who is neither owner nor collaborator gets 403."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.put(
            f"/api/trips/{trip_id}",
            json={"trip_name": "Hijacked"},
            cookies=outsider["cookies"],
        )
        assert response.status_code == 403

    def test_update_with_no_fields(self, client, shared_trip):
        """An empty update body is rejected instead of being treated as a no-op."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.put(f"/api/trips/{trip_id}", json={}, cookies=owner["cookies"])
        assert response.status_code == 400

    def test_update_cannot_change_owner(self, client, shared_trip):
        """owner_id is popped from update data even if the client sends it."""
        trip_id, owner, collaborator, outsider = shared_trip
        client.put(
            f"/api/trips/{trip_id}",
            json={"trip_name": "x"},
            cookies=owner["cookies"],
        )
        saved = client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).json()
        assert saved["owner_id"] == owner["id"]

class TestDeletePermissions:
    """DELETE /api/trips/{id} — tier 2, owner-only access."""

    def test_owner_can_delete(self, client, shared_trip):
        """Tier 2: only the owner may delete."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.delete(f"/api/trips/{trip_id}", cookies=owner["cookies"])
        assert response.status_code == 200
        assert client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).status_code == 404

    def test_collaborator_cannot_delete(self, client, shared_trip):
        """Tier 2: collaborators have edit access but NOT delete access."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.delete(f"/api/trips/{trip_id}", cookies=collaborator["cookies"])
        assert response.status_code == 403

    def test_outsider_cannot_delete(self, client, shared_trip):
        """A user with no relationship to the trip cannot delete it."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.delete(f"/api/trips/{trip_id}", cookies=outsider["cookies"])
        assert response.status_code == 403

    def test_delete_unknown_trip(self, client, default_user):
        """Deleting an id that doesn't exist returns 404."""
        response = client.delete(
            "/api/trips/0123456789abcdef01234567", cookies=default_user["cookies"]
        )
        assert response.status_code == 404

# Trip experience linking 
@pytest.fixture()
def linked_experience(client, shared_trip):
    """An experience created by the owner, ready to link to the shared trip."""
    trip_id, owner, collaborator, outsider = shared_trip
    response = client.post(
        "/api/experiences",
        json={
            "user_id": "ignored",
            "title": "Cape Town hike",
            "location_name": "Table Mountain",
            "location_geojson": {"type": "Point", "coordinates": [18.4, -33.9]},
        },
        cookies=owner["cookies"],
    )
    assert response.status_code == 201
    return response.json()["id"]

class TestLinkExperience:
    """POST /api/trips/{trip_id}/experiences/{experience_id} — tier 1 linking."""

    def test_owner_can_link(self, client, shared_trip, linked_experience):
        """The owner can attach an experience, and the id lands in experience_ids."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.post(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=owner["cookies"],
        )
        assert response.status_code == 201
        saved = client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).json()
        assert saved["experience_ids"] == [linked_experience]

    def test_collaborator_can_link(self, client, shared_trip, linked_experience):
        """Tier 1: linking is shared access, same as update."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.post(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=collaborator["cookies"],
        )
        assert response.status_code == 201

    def test_outsider_cannot_link(self, client, shared_trip, linked_experience):
        """A user with no relationship to the trip cannot link to it."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.post(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=outsider["cookies"],
        )
        assert response.status_code == 403

# The following three test functions were generated with the help of Qwen 2.5. The transcript [https://oregonstateuniversity-my.sharepoint.com/:w:/g/personal/valderrm_oregonstate_edu/IQB9LrvrOmcNSJcl7jhF9_5uAQsnhLruhQ5L5Vp4tvgBgos?e=npK8ax] documents the GenAI interaction that led to these three functions under the Test_Trips.py Section.
    def test_duplicate_link_does_not_duplicate(
        self, client, shared_trip, linked_experience
    ):
        """$addToSet must keep the id list unique across repeated links."""
        trip_id, owner, collaborator, outsider = shared_trip
        for _ in range(3):
            client.post(
                f"/api/trips/{trip_id}/experiences/{linked_experience}",
                cookies=owner["cookies"],
            )
        saved = client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).json()
        assert saved["experience_ids"] == [linked_experience]

    def test_link_unknown_experience(self, client, shared_trip):
        """Linking an experience id that doesn't exist returns 404."""
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.post(
            f"/api/trips/{trip_id}/experiences/0123456789abcdef01234567",
            cookies=owner["cookies"],
        )
        assert response.status_code == 404

    def test_link_to_unknown_trip(self, client, default_user, linked_experience):
        """Linking to a trip id that doesn't exist returns 404."""
        response = client.post(
            f"/api/trips/0123456789abcdef01234567/experiences/{linked_experience}",
            cookies=default_user["cookies"],
        )
        assert response.status_code == 404

class TestUnlinkExperience:
    """DELETE /api/trips/{trip_id}/experiences/{experience_id} — tier 1 unlinking."""

    def test_unlink_removes_experience(self, client, shared_trip, linked_experience):
        """Unlinking pulls the id back out of experience_ids."""
        trip_id, owner, collaborator, outsider = shared_trip
        client.post(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=owner["cookies"],
        )

        response = client.delete(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=owner["cookies"],
        )
        assert response.status_code == 200
        saved = client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).json()
        assert saved["experience_ids"] == []

    def test_collaborator_can_unlink(self, client, shared_trip, linked_experience):
        """Tier 1: unlinking is shared access, same as linking."""
        trip_id, owner, collaborator, outsider = shared_trip
        client.post(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=owner["cookies"],
        )
        response = client.delete(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=collaborator["cookies"],
        )
        assert response.status_code == 200

    def test_outsider_cannot_unlink(self, client, shared_trip, linked_experience):
        """A user with no relationship to the trip cannot unlink from it."""
        trip_id, owner, collaborator, outsider = shared_trip
        client.post(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=owner["cookies"],
        )
        response = client.delete(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=outsider["cookies"],
        )
        assert response.status_code == 403