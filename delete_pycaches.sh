#!/bin/bash
for dir in $(find back/ -type d -name "__pycache__"); do
    git rm -r --cached "$dir"
done

