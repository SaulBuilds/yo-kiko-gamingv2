#!/bin/bash

# Run Prettier formatter
echo "Running formatter..."
npx prettier --write "**/*.{js,jsx,ts,tsx,json,md}"