# Ahctam

## React/Next

In the directory that contains yarn.lock

```
yarn install
yarn dev
```

or

```
npm install
npm run dev
```

## Flask

### Requirements

- Having at least python3.10 available
- Install docker engine

### 1) Run docker

```
docker compose up --build
```

### 2) Create / activate your virtual environment

If it's the first time:

```
python3.10 -m venv venv
```

Then:

```
source venv/bin/activate
```

If you want to to deactivate it

```
deactivate
```

### 3) Install the dependencies in the venv

```
pip install -r requirements.txt
```

### 4) Create and populate your database

With the venv activated and the docker compose running, please run:

```
python create_db.py
```

### 5) Have fun with your hamsters

You can now run your backend with your venv activated:

```
python app.py
```

And in another terminal, run your frontend, making sure npm is updated:

```
npm install
npm run dev
```

### Tips - Cheatsheet

<app_name> is the name of your .py file, without extension

You can get rid of --app if you name your file app.py

To run the development server:

```
flask --app <app_name> run
```

To run it inside the network instead of locally:

```
$ flask run --host=0.0.0.0
```

For debug and live-server behavior:

```
flask --app hello run --debug
```

Use escape() to prevent injections. It renders input as text

```python
from markupsafe import escape
def hello(name):
    return f"Hello, {escape(name)}"
```
