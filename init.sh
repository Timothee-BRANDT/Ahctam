#!/bin/bash

# To automatically activate the venv after the script, run source init.sh

VENV="matcha_venv"

python3 -m venv $VENV
source $VENV/bin/activate

if [ ! -f .gitignore ]; then
    touch .gitignore
    echo ".gitignore created"
fi
if ! grep -q "__pycache__/" .gitignore; then
    echo "__pycache__/" >> .gitignore
    echo "pycache folders added to .gitignore"
fi
if ! grep -q $VENV .gitignore; then
    echo $VENV >> .gitignore
    echo "$VENV added to .gitignore"
fi
if [ ! -f requirements.txt ]; then
    echo "requirements.txt not found"
    return
fi

pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "An error occurred while installing the dependencies."
    return
  else
    echo "Dependencies installed successfully."
fi
