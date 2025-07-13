#!/bin/bash
echo "=== CLAUDIA ENVIRONMENT TEST ==="
echo "PATH: $PATH"
echo "NODE: $(which node 2>/dev/null || echo 'NOT FOUND')"
echo "USER: $USER"
echo "HOME: $HOME"
echo "PWD: $PWD"
echo "=== END TEST ==="
