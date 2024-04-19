def test_register_with_valid_username(client):
    valid_data = {
        'username': 'validUsername',
        'password': 'ValidPass123!',
        'password2': 'ValidPass123!',
        'email': 'user@example.com'
    }
    response = client.post('/register', json=valid_data)
    assert response.status_code == 200


def test_register_with_short_username(client):
    invalid_data = {
        'username': 'us',  # Assuming the minimum length is 3 characters
        'password': 'ValidPass123!',
        'password2': 'ValidPass123!',
        'email': 'user@example.com'
    }
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 400
    assert b'Username must be at least 3 characters long' in response.data
