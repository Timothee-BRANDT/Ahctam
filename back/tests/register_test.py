def test_register_with_valid_username(client):
    valid_data = {
        'username': 'validUsername',
        'password': 'ValidPass123!',
        'password2': 'ValidPass123!',
        'email': 'user@example.com'
    }
    response = client.post('/register', json=valid_data)
    print(response.data)
    assert response.status_code == 200


def test_register_with_short_username(client):
    invalid_data = {
        'username': 'us',
        'password': 'ValidPass123!',
        'password2': 'ValidPass123!',
        'email': 'user@example.com'
    }
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 400
    assert b'Username must be at least 3 characters long' in response.data


def test_username_already_exists(client):
    existing_data = {
        'username': 'existingUser',
        'password': 'ValidPass123!',
        'password2': 'ValidPass123!',
        'email': 'email@email.com',
    }
    response = client.post('/register', json=existing_data)
    assert response.status_code == 200
    response = client.post('/register', json=existing_data)
    assert response.status_code == 400
    assert b'Username already exists' in response.data
