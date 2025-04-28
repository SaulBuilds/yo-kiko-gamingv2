#!/bin/bash

# Run ESLint
echo "Running linter..."
npx eslint --config eslint.config.js . --ext .js,.jsx,.ts,.tsx "$@"