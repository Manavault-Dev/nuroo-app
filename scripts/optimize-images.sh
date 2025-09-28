#!/bin/bash

# Image Optimization Script for Nuroo App
# This script optimizes images for better performance

echo "🖼️  Optimizing images for better performance..."

# Create optimized directory
mkdir -p assets/images/optimized

# Function to optimize PNG images
optimize_png() {
    local input="$1"
    local output="$2"
    local max_width="$3"
    
    echo "Optimizing $input..."
    
    # Use ImageMagick to resize and optimize
    if command -v magick &> /dev/null; then
        magick "$input" -resize "${max_width}x>" -strip -quality 85 "$output"
    elif command -v convert &> /dev/null; then
        convert "$input" -resize "${max_width}x>" -strip -quality 85 "$output"
    else
        echo "⚠️  ImageMagick not found. Please install it for image optimization."
        cp "$input" "$output"
    fi
}

# Optimize different types of images
optimize_png "assets/images/logo.png" "assets/images/optimized/logo.png" "200"
optimize_png "assets/images/onboard.png" "assets/images/optimized/onboard.png" "400"
optimize_png "assets/images/sign-in.png" "assets/images/optimized/sign-in.png" "400"
optimize_png "assets/images/sign-up.png" "assets/images/optimized/sign-up.png" "400"
optimize_png "assets/images/NurooArc.png" "assets/images/optimized/NurooArc.png" "300"

# Copy smaller images as-is
cp assets/images/icon.png assets/images/optimized/icon.png
cp assets/images/adaptive-icon.png assets/images/optimized/adaptive-icon.png
cp assets/images/favicon.png assets/images/optimized/favicon.png
cp assets/images/splash-icon.png assets/images/optimized/splash-icon.png

echo "✅ Image optimization complete!"
echo "📊 Original size: $(du -sh assets/images/ | cut -f1)"
echo "📊 Optimized size: $(du -sh assets/images/optimized/ | cut -f1)"
