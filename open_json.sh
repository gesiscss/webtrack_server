#!/bin/bash

python -m json.tool pages_backup/`ls -Art pages_backup/ | tail -n $1 | head -n 1`
