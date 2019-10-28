#!/bin/bash

python -m json.tool storage/json/`ls -Art storage/json/ | tail -n $1 | head -n 1`
