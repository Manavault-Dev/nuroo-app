#!/bin/bash

# Bundle Analysis Script for Nuroo App
# This script analyzes the bundle size and provides optimization suggestions

echo "📊 Analyzing bundle size..."

# Export web bundle for analysis
echo "🔨 Building web bundle..."
npx expo export --platform web --output-dir dist-analysis

# Analyze bundle size
echo "📈 Bundle Analysis Results:"
echo "=========================="

# Main JS bundle size
JS_BUNDLE=$(find dist-analysis -name "*.js" -exec ls -la {} \; | awk '{sum += $5} END {print sum}')
JS_BUNDLE_MB=$((JS_BUNDLE / 1024 / 1024))

echo "📦 Main JS Bundle: ${JS_BUNDLE_MB} MB"

# Font assets size
FONT_SIZE=$(find dist-analysis -name "*.ttf" -exec ls -la {} \; | awk '{sum += $5} END {print sum}')
FONT_SIZE_MB=$((FONT_SIZE / 1024 / 1024))

echo "🔤 Font Assets: ${FONT_SIZE_MB} MB"

# Image assets size
IMAGE_SIZE=$(find dist-analysis -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -exec ls -la {} \; | awk '{sum += $5} END {print sum}')
IMAGE_SIZE_MB=$((IMAGE_SIZE / 1024 / 1024))

echo "🖼️  Image Assets: ${IMAGE_SIZE_MB} MB"

# Total size
TOTAL_SIZE=$((JS_BUNDLE + FONT_SIZE + IMAGE_SIZE))
TOTAL_SIZE_MB=$((TOTAL_SIZE / 1024 / 1024))

echo "📊 Total Bundle Size: ${TOTAL_SIZE_MB} MB"

echo ""
echo "🎯 Optimization Recommendations:"
echo "================================"

if [ $JS_BUNDLE_MB -gt 2 ]; then
    echo "⚠️  JS Bundle is too large (${JS_BUNDLE_MB} MB). Consider:"
    echo "   - Code splitting and lazy loading"
    echo "   - Removing unused dependencies"
    echo "   - Tree shaking optimization"
fi

if [ $FONT_SIZE_MB -gt 1 ]; then
    echo "⚠️  Font assets are large (${FONT_SIZE_MB} MB). Consider:"
    echo "   - Using only necessary icon fonts"
    echo "   - Font subsetting"
fi

if [ $IMAGE_SIZE_MB -gt 1 ]; then
    echo "⚠️  Image assets are large (${IMAGE_SIZE_MB} MB). Consider:"
    echo "   - Image compression"
    echo "   - WebP format conversion"
    echo "   - Responsive images"
fi

if [ $TOTAL_SIZE_MB -lt 5 ]; then
    echo "✅ Bundle size is acceptable for mobile apps"
else
    echo "⚠️  Total bundle size is large (${TOTAL_SIZE_MB} MB). Consider optimization."
fi

echo ""
echo "📁 Analysis files saved to: dist-analysis/"
