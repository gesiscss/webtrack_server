#!/bin/bash

python3 -m json.tool storage/json/`ls -Art storage/json/ | tail -n $1 | head -n 1`
