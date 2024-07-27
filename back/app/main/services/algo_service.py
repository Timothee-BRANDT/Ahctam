import math
# import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# from app.authentication.views.decorators import jwt_required


def haversine(lat1, lon1, lat2, lon2):
    earth_radius = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = earth_radius * c

    return distance


def age_similarity(age1, age2):
    return 1 / (1 + abs(age1 - age2))


def interest_similarity(interests1, interests2):
    interests1: list = interests1.split(', ')
    interests2: list = interests2.split(', ')

    vectorizer = CountVectorizer().fit(interests1 + interests2)
    print(type(vectorizer))
    print('vectorizer', vectorizer)
    vector_1 = vectorizer.transform(interests1).toarray()
    print(type(vector_1))
    print('vector_1', vector_1)
    vector_2 = vectorizer.transform(interests2).toarray()
    print(type(vector_2))
    print('vector_2', vector_2)

    return cosine_similarity(vector_1, vector_2)[0][0]


def fame_similarity(fame1, fame2):
    return 1 / (1 + abs(fame1 - fame2))


def matching_score(user1, user2):
    geo_weight = 0.5
    age_weight = 0.3
    interest_weight = 0.3
    fame_weight = 0.1

    geo_score = haversine(user1['latitude'], user1['longitude'],
                          user2['latitude'], user2['longitude']) * geo_weight
    print('geo_score', geo_score)
    age_score = age_similarity(user1['age'], user2['age']) * age_weight
    print('age_score', age_score)
    print('1', user1['interests'])
    print('2', user2['interests'])
    interest_score = interest_similarity(
        user1['interests'], user2['interests']) * interest_weight
    print('interest_score', interest_score)
    fame_score = fame_similarity(user1['fame'], user2['fame']) * fame_weight
    print('fame_score', fame_score)

    return geo_score + age_score + interest_score + fame_score
