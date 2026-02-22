#!/bin/bash

# Git Update Script for Civic Issue Tracker
echo "🚀 Updating GitHub Repository..."

# Add all changes
git add .

# Commit with timestamp
git commit -m "Update: Enhanced login pages with credentials and deployment ready - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to main branch
git push origin main

echo "✅ Repository updated successfully!"
echo "📋 Changes include:"
echo "- Enhanced login pages with demo credentials"
echo "- Added deployment configuration files"
echo "- Fixed missing dependencies and modules"
echo "- Added comprehensive documentation"