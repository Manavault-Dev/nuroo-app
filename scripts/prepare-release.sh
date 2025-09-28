#!/bin/bash

# Release Preparation Script for Nuroo App
# This script prepares the app for App Store and Google Play submission

set -e

echo "🚀 Preparing Nuroo App for Release..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v expo &> /dev/null; then
        print_error "Expo CLI is not installed. Run: npm install -g @expo/cli"
        exit 1
    fi
    
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed. Run: npm install -g eas-cli"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Run quality checks
run_quality_checks() {
    print_status "Running quality checks..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Run linting
    print_status "Running ESLint..."
    npm run lint
    
    # Run type checking
    print_status "Running TypeScript type checking..."
    npm run typecheck
    
    # Run tests
    print_status "Running tests..."
    npm run test:ci
    
    # Check formatting
    print_status "Checking code formatting..."
    npm run format:check
    
    print_success "All quality checks passed!"
}

# Optimize assets
optimize_assets() {
    print_status "Optimizing assets..."
    
    # Optimize images
    if [ -f "scripts/optimize-images.sh" ]; then
        bash scripts/optimize-images.sh
    else
        print_warning "Image optimization script not found, skipping..."
    fi
    
    # Analyze bundle
    if [ -f "scripts/analyze-bundle.sh" ]; then
        bash scripts/analyze-bundle.sh
    else
        print_warning "Bundle analysis script not found, skipping..."
    fi
    
    print_success "Asset optimization complete!"
}

# Update version and build number
update_version() {
    print_status "Updating version information..."
    
    # Get current version
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    print_status "Current version: $CURRENT_VERSION"
    
    # Ask for new version
    read -p "Enter new version (current: $CURRENT_VERSION): " NEW_VERSION
    
    if [ -z "$NEW_VERSION" ]; then
        NEW_VERSION=$CURRENT_VERSION
    fi
    
    # Update package.json
    npm version $NEW_VERSION --no-git-tag-version
    
    print_success "Version updated to $NEW_VERSION"
}

# Build for production
build_production() {
    print_status "Building for production..."
    
    # Build Android
    print_status "Building Android app..."
    eas build --platform android --profile production --non-interactive
    
    # Build iOS
    print_status "Building iOS app..."
    eas build --platform ios --profile production --non-interactive
    
    print_success "Production builds complete!"
}

# Generate release notes
generate_release_notes() {
    print_status "Generating release notes..."
    
    # Get git log since last tag
    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    if [ -z "$LAST_TAG" ]; then
        print_warning "No previous tags found, generating full changelog..."
        git log --oneline > RELEASE_NOTES.md
    else
        print_status "Generating changelog since $LAST_TAG..."
        git log $LAST_TAG..HEAD --oneline > RELEASE_NOTES.md
    fi
    
    print_success "Release notes generated in RELEASE_NOTES.md"
}

# Main execution
main() {
    print_status "Starting release preparation for Nuroo App..."
    
    # Check dependencies
    check_dependencies
    
    # Run quality checks
    run_quality_checks
    
    # Optimize assets
    optimize_assets
    
    # Update version
    update_version
    
    # Generate release notes
    generate_release_notes
    
    # Ask if user wants to build
    read -p "Do you want to build for production? (y/N): " BUILD_CHOICE
    
    if [[ $BUILD_CHOICE =~ ^[Yy]$ ]]; then
        build_production
    else
        print_status "Skipping production build"
    fi
    
    print_success "Release preparation complete!"
    print_status "Next steps:"
    echo "1. Review RELEASE_NOTES.md"
    echo "2. Test the builds"
    echo "3. Submit to app stores using:"
    echo "   - Android: eas submit --platform android"
    echo "   - iOS: eas submit --platform ios"
}

# Run main function
main "$@"
