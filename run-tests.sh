#!/bin/bash

# Run Jest tests
echo "Running tests..."
NODE_OPTIONS="--experimental-vm-modules" npx jest "$@"