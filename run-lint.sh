#!/bin/bash

# Run ESLint
echo "Running linter..."
npx eslint . --ext .js,.jsx,.ts,.tsx "$@"