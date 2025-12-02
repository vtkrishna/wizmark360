#!/bin/bash

##############################################################################
# WAI SDK - One-Click Deployment Script
#
# This script sets up and deploys the WAI SDK for use in your projects
#
# Usage:
#   ./deploy.sh          # Interactive setup
#   ./deploy.sh --link   # Link to local project
#   ./deploy.sh --publish # Publish to npm
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Print banner
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  WAI SDK v1.0 - One-Click Deployment"
echo "  Enterprise AI Orchestration Platform"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js version
print_info "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Build the SDK
print_info "Building WAI SDK..."
npm run build
print_success "WAI SDK built successfully"

# Check for build output
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Build artifacts generated in dist/"

# Handle deployment mode
MODE="${1:-interactive}"

case $MODE in
    --link)
        print_info "Linking WAI SDK for local development..."
        npm link
        print_success "WAI SDK linked! Use 'npm link @wizards-ai/wai-sdk' in your project"
        echo ""
        print_info "In your project directory, run:"
        echo "  npm link @wizards-ai/wai-sdk"
        ;;
    
    --publish)
        print_warning "Publishing to npm..."
        echo ""
        read -p "Are you sure you want to publish? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm publish --access public
            print_success "Published to npm as @wizards-ai/wai-sdk"
        else
            print_info "Publish cancelled"
        fi
        ;;
    
    interactive|*)
        echo ""
        echo "Choose deployment option:"
        echo "  1) Link for local development (npm link)"
        echo "  2) Create tarball for manual install"
        echo "  3) Publish to npm registry"
        echo "  4) Exit"
        echo ""
        read -p "Select option (1-4): " -n 1 -r
        echo ""
        
        case $REPLY in
            1)
                npm link
                print_success "WAI SDK linked!"
                echo ""
                print_info "Next steps:"
                echo "  cd /path/to/your/project"
                echo "  npm link @wizards-ai/wai-sdk"
                ;;
            2)
                print_info "Creating tarball..."
                npm pack
                TARBALL=$(ls wizards-ai-wai-sdk-*.tgz | tail -n 1)
                print_success "Tarball created: $TARBALL"
                echo ""
                print_info "Install in your project with:"
                echo "  npm install /path/to/$TARBALL"
                ;;
            3)
                print_warning "Publishing to npm..."
                npm publish --access public
                print_success "Published to npm!"
                ;;
            4)
                print_info "Deployment cancelled"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                exit 1
                ;;
        esac
        ;;
esac

# Print usage examples
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  WAI SDK Ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "WAI SDK is ready to use!"
echo ""
print_info "Quick Start:"
echo ""
echo "import { OrchestrationFacade } from '@wizards-ai/wai-sdk';"
echo ""
echo "const facade = new OrchestrationFacade({"
echo "  studioId: 'my-app',"
echo "  enableMonitoring: true,"
echo "});"
echo ""
echo "const result = await facade.executeWorkflow('content-generation', {"
echo "  prompt: 'Write a blog post about AI',"
echo "}, {"
echo "  type: 'creative',"
echo "  costOptimization: true,"
echo "});"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_info "Documentation: ./README.md"
print_info "Examples: ./examples/"
print_info "Quick Start: ./QUICK_START.md"
echo ""
print_success "Happy building! 🚀"
echo ""
