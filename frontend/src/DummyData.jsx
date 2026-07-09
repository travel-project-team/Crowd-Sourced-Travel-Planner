user_1 = {
    _id: 1,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    email: "johndoe@gmail.com",
}

user_2 = {
    _id: 2,
    first_name: "Jane",
    last_name: "Smith",
    username: "janesmith",
    email: "janesmith@gmail.com",
}

user_3 = {
    _id: 3,
    first_name: "Jill",
    last_name: "Donovan",
    username: "jilldonovan",
    email: "jilldonovan@gmail.com",
}

users = [user_1, user_2, user_3]

trip_1 = {
    _id: 1,
    trip_name: "Paris",
    trip_description: "A trip to Paris",
    owner_id: 1,
    collaborator_ids: [2, 3],
    experiece_ids: [1, 2],
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
}

trip_2 = {
    _id: 2,
    trip_name: "New York",
    trip_description: "A trip to New York",
    owner_id: 2,
    collaborator_ids: [1, 3],
    experiece_ids: [3, 4],
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z"
}

trips = [trip_1, trip_2]

experience_1 = {
    _id: 1,
    user_id: 1,
    title: "Eiffel Tower",
    description: "A trip to the Eiffel Tower",
    location_name: "Paris, France",
    location_jeojson: {
        "type": "Point",
        "coordinates": [2.2945, 48.8584]
    },
    ratings: [5, 4, 3],
    average_rating: 4,
    keywords: ["landmark", "tourist attraction", "view"],
    created_at: "2023-01-01T00:00:00.000Z",
    image_url: "../tungtung.jpeg"
}

experience_2 = {
    _id: 2,
    user_id: 2,
    title: "Louvre Museum",
    description: "A trip to the Louvre Museum",
    location_name: "Paris, France",
    location_jeojson: {
        "type": "Point",
        "coordinates": [2.3364, 48.8606]
    },
    ratings: [5, 4, 2],
    average_rating: 3.67,
    keywords: ["museum", "art", "history"],
    created_at: "2023-01-01T00:00:00.000Z",
    image_url: "../tungtung.jpeg"
}

experience_3 = {
    _id: 3,
    user_id: 3,
    title: "Statue of Liberty",
    description: "A trip to the Statue of Liberty",
    location_name: "New York, USA",
    location_jeojson: {
        "type": "Point",
        "coordinates": [-74.0445, 40.6892]
    },
    ratings: [5],
    average_rating: 5,
    keywords: ["landmark", "tourist attraction", "view"],
    created_at: "2023-01-01T00:00:00.000Z",
    image_url: "../tungtung.jpeg"
}

experience_4 = {
    _id: 4,
    user_id: 1,
    title: "Central Park",
    description: "A trip to Central Park",
    location_name: "New York, USA",
    location_jeojson: {
        "type": "Point",
        "coordinates": [-73.9654, 40.7829]
    },
    ratings: [5, 4],
    average_rating: 4.5,
    keywords: ["park", "nature", "outdoors"],
    created_at: "2023-01-01T00:00:00.000Z",
    image_url: "../tungtung.jpeg"
}

experiences = [experience_1, experience_2, experience_3, experience_4]

export const dummyData = {
    users: users,
    trips: trips,
    experiences: experiences
}