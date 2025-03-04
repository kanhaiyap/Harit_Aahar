#!/bin/bash
set -e

echo "Switching to 'deploy' branch..."
# Create (or switch to) the deploy branch
git checkout -B deploy

echo "Staging all changes..."
# Stage all modified, added, and removed files
git add -A

echo "Committing changes..."
# Create a commit message. Using --allow-empty to trigger a commit even if there are no changes.
COMMIT_MESSAGE="Deployment triggered at $(date)"
git commit -m "$COMMIT_MESSAGE" --allow-empty

echo "Pushing 'deploy' branch to GitHub..."
git push -u origin deploy

echo "Deployment triggered. Check the GitHub Actions tab for workflow status."
