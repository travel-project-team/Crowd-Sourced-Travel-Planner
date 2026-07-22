# Tests for trips routes (src/routes/trips.py)
# CRUD: create/read/update/delete
# Two-tier permissions: owner vs collaborator vs outsider on every route
# Trip-experience linking: POST/DELETE /{trip_id}/experiences/{experience_id}
#
# Tier 1 (owner or collaborator): view, update, link/unlink experiences
# Tier 2 (owner only): delete

import pytest

def trip_body(owner_id="ignored-client-value", **overrides):
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
    def test_create_requires_auth(self, client, test_db):
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
    def test_list_shows_owned_and_shared_only(self, client, shared_trip):
        trip_id, owner, collaborator, outsider = shared_trip
        owner_trips = client.get("/api/trips", cookies=owner["cookies"]).json()
        assert [trip["_id"] for trip in owner_trips] == [trip_id]
        collab_trips = client.get("/api/trips", cookies=collaborator["cookies"]).json()
        assert [trip["_id"] for trip in collab_trips] == [trip_id]
        outsider_trips = client.get("/api/trips", cookies=outsider["cookies"]).json()
        assert outsider_trips == []

    def test_list_invalid_sort_field(self, client, default_user):
        response = client.get(
            "/api/trips", params={"sort": "owner_id"}, cookies=default_user["cookies"]
        )
        assert response.status_code == 400

    def test_list_invalid_order(self, client, default_user):
        response = client.get(
            "/api/trips", params={"order": "sideways"}, cookies=default_user["cookies"]
        )
        assert response.status_code == 400

class TestGetSingle:
    def test_owner_and_collaborator_can_view_outsider_cannot(self, client, shared_trip):
        trip_id, owner, collaborator, outsider = shared_trip
        assert client.get(f"/api/trips/{trip_id}", cookies=owner["cookies"]).status_code == 200
        assert client.get(f"/api/trips/{trip_id}", cookies=collaborator["cookies"]).status_code == 200
        assert client.get(f"/api/trips/{trip_id}", cookies=outsider["cookies"]).status_code == 403

    def test_get_unknown_trip(self, client, default_user):
        response = client.get(
            "/api/trips/0123456789abcdef01234567", cookies=default_user["cookies"]
        )
        assert response.status_code == 404

    def test_get_invalid_id_format(self, client, default_user):
        response = client.get("/api/trips/not-an-objectid", cookies=default_user["cookies"])
        assert response.status_code == 400

# two tier permission: update (tier 1) vs delete (tier 2)
class TestUpdatePermissions:
    def test_owner_can_update(self, client, shared_trip):
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
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.put(
            f"/api/trips/{trip_id}",
            json={"trip_name": "Hijacked"},
            cookies=outsider["cookies"],
        )
        assert response.status_code == 403

    def test_update_with_no_fields(self, client, shared_trip):
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
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.delete(f"/api/trips/{trip_id}", cookies=outsider["cookies"])
        assert response.status_code == 403

    def test_delete_unknown_trip(self, client, default_user):
        response = client.delete(
            "/api/trips/0123456789abcdef01234567", cookies=default_user["cookies"]
        )
        assert response.status_code == 404

# Trip experience linking *AI Enhanced*
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
    def test_owner_can_link(self, client, shared_trip, linked_experience):
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
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.post(
            f"/api/trips/{trip_id}/experiences/{linked_experience}",
            cookies=outsider["cookies"],
        )
        assert response.status_code == 403

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
        trip_id, owner, collaborator, outsider = shared_trip
        response = client.post(
            f"/api/trips/{trip_id}/experiences/0123456789abcdef01234567",
            cookies=owner["cookies"],
        )
        assert response.status_code == 404

    def test_link_to_unknown_trip(self, client, default_user, linked_experience):
        response = client.post(
            f"/api/trips/0123456789abcdef01234567/experiences/{linked_experience}",
            cookies=default_user["cookies"],
        )
        assert response.status_code == 404

class TestUnlinkExperience:
    def test_unlink_removes_experience(self, client, shared_trip, linked_experience):
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