# Ahctam

## React/Next

In the directory that contains yarn.lock

```
yarn install
yarn dev
```

## Flask

### Requirements

Having at least python3.10 available.
Install postgresql.

#### On debian based/Ubuntu:

```
sudo apt install postgresql postgresql-contrib libpq-dev
sudo apt install python3-dev build-essential
```

To test it

```
sudo -u postgres psql
```

To install and start the venv

```
source init.sh
```

To desactivate it

```
deactivate
```

### QuickStart

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

Use escape() to prevent injections

It renders input as text

```python
from markupsafe import escape
def hello(name):
    return f"Hello, {escape(name)}"
```
