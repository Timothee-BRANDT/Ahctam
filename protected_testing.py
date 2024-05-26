import requests

url = 'http://localhost:5000/auth/protected'

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJlZG91YXJkIiwiZXhwIjoxNzE2NzE4NzU3fQ.MCveHNbz0bkuTCpGS1FRS5yLm6anjoMrMVzLRg_XzC0'

response = requests.get(
    url,
    headers={'Authorization': f'Bearer {token}'})

if response.status_code == 200:
    print('Protected route response:', response.json())
else:
    print('Error:', response.json())
