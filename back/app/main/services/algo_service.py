import math
from typing import List, Dict
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# from app.authentication.views.decorators import jwt_required


def haversine(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:
    earth_radius = 6371
    max_earth_distance = 20000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = earth_radius * c
    normalized_distance = distance / max_earth_distance

    return 1 - normalized_distance


def age_similarity(
    age1: int,
    age2: int
) -> float:
    return 1 / (1 + abs(age1 - age2))


def interest_similarity(
    interests1: str,
    interests2: str
) -> float:
    interests_1_list: List[str] = [interests1]
    interests_2_list: List[str] = [interests2]

    vectorizer = CountVectorizer().fit(interests_1_list + interests_2_list)

    vector_1: np.ndarray = vectorizer.transform(interests_1_list).toarray()
    vector_2: np.ndarray = vectorizer.transform(interests_2_list).toarray()

    return cosine_similarity(vector_1, vector_2)[0][0]


def fame_similarity(
    fame1: float,
    fame2: float
) -> float:
    return 1 / (1 + abs(fame1 - fame2))


def matching_score(
    user1: Dict,
    user2: Dict
):
    geo_weight = 0.5
    age_weight = 0.3
    interest_weight = 0.3
    fame_weight = 0.1

    geo_score = haversine(
        user1['latitude'],
        user1['longitude'],
        user2['latitude'],
        user2['longitude']
    ) * geo_weight

    age_score = age_similarity(
        user1['age'],
        user2['age']
    ) * age_weight

    interest_score = interest_similarity(
        user1['interests'],
        user2['interests']
    ) * interest_weight

    fame_score = fame_similarity(
        user1['fame'],
        user2['fame']
    ) * fame_weight

    return geo_score + age_score + interest_score + fame_score
