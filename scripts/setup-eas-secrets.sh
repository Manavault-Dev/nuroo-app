#!/bin/bash

# Script to set up EAS environment variables from .env file
# This script reads your .env file and sets up EAS env vars for your builds

set -e

echo "🔐 Setting up EAS environment variables for Firebase configuration..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Firebase configuration."
    exit 1
fi

# Source the .env file to get the values
export $(grep -v '^#' .env | xargs)

# Array of environment variable names to set
ENV_VARS=(
    "EXPO_PUBLIC_FIREBASE_API_KEY"
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID"
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "EXPO_PUBLIC_FIREBASE_APP_ID"
    "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

echo "📝 Setting Firebase environment variables for preview and production environments..."
echo ""

# Set environment variables for both preview and production environments
for ENV_VAR in "${ENV_VARS[@]}"; do
    VALUE="${!ENV_VAR}"
    
    if [ -z "$VALUE" ]; then
        echo "⚠️  Warning: $ENV_VAR is empty, skipping..."
        continue
    fi
    
    echo "Setting $ENV_VAR..."
    
    # Set for preview environment (TestFlight)
    eas env:create --name "$ENV_VAR" --value "$VALUE" --environment preview --scope project --visibility plaintext --force --non-interactive
    
    # Set for production environment
    eas env:create --name "$ENV_VAR" --value "$VALUE" --environment production --scope project --visibility plaintext --force --non-interactive
    
    echo "  ✓ Set for preview and production environments"
done

echo ""
echo "✅ EAS environment variables have been set up successfully!"
echo ""
echo "You can now build your app for TestFlight using:"
echo "  npm run build:preview:ios"
echo ""
echo "To view all environment variables, run:"
echo "  eas env:list --environment preview"
echo "  eas env:list --environment production"
echo ""
