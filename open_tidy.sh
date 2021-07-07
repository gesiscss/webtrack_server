#!/bin/bash

tidy storage/html/`ls -Art storage/html/ | tail -n $1 | head -n 1 | sed 's/html/json/g'`
