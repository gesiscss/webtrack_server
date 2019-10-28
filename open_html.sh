#!/bin/bash

lynx storage/html/`ls -Art storage/html/ | tail -n $1 | head -n 1`
