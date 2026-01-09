#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running migrations..."
npm run migration:run:prod

echo "Starting application..."
npm run start:prod
