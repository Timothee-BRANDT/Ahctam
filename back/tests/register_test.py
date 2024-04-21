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


def test_register_with_long_username(client):
    invalid_data = {
        'username': 'a' * 21,
        'password': 'ValidPass123!',
        'password2': 'ValidPass123!',
        'email': 'email@email.com',
    }
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 400
    assert b'Username must be less than 20 characters long' in response.data


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


def test_register_password(client):
    invalid_data = {
        'username': 'newValidUsername',
        'password': 'invalid_data123!',
        'password2': 'invalid_data123!',
        'email': 'mymail@mymail.com',
    }
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 400

    invalid_data['password'] = 'short1!'
    invalid_data['password2'] = 'short1!'
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 400

    invalid_data['password'] = 'InvalidData123'
    invalid_data['password2'] = 'InvalidData123'
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 400

    invalid_data['password'] = 'InvalidData!'
    invalid_data['password2'] = 'InvalidData!'
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 400

    invalid_data['password'] = 'ValidData123!'
    response = client.post('/register', json=invalid_data)
    assert b'Passwords do not match' in response.data
    invalid_data['password2'] = 'ValidData123!'
    response = client.post('/register', json=invalid_data)
    assert response.status_code == 200


def test_register_email(client):
    data = {
        'username': 'newValidUsername',
        'password': 'ValidData123!',
        'password2': 'ValidData123!',
        'email': 'invalid_email.com',
    }
    response = client.post('/register', json=data)
    assert response.status_code == 400
    assert b'Invalid email address' in response.data

    data['email'] = 'exists@email.com'
    response = client.post('/register', json=data)
    assert response.status_code == 200
    data['username'] = 'newValidUsername2'
    response = client.post('/register', json=data)
    assert response.status_code == 400
    assert b'Email already exists' in response.data
