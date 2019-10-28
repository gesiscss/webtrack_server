#!/bin/bash

python -m json.tool storage/error/`ls -Art storage/error/ | tail -n $1 | head -n 1`
