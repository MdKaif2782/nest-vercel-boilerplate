#!/bin/bash

# Local Deployment Script for NestJS Backend
# Run this from your local machine to deploy to server

# Configuration
REMOTE_USER="root"
REMOTE_HOST="103.132.96.118"
REMOTE_DIR="/var/www/nest-backend"
LOCAL_DIR="/Users/mdkaifibnzaman/IdeaProjects/middleman-backend"  # Update this path

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Build the backend
build_backend() {
    log "Building NestJS backend..."
    cd "$LOCAL_DIR" || error "Failed to navigate to $LOCAL_DIR"
    
    # Check if yarn or npm
    if [ -f "yarn.lock" ]; then
        log "Using Yarn..."
        yarn install || error "Yarn install failed"
        yarn build || error "Yarn build failed"
    else
        log "Using NPM..."
        npm install || error "NPM install failed"
        npm run build || error "NPM build failed"
    fi
    
    # Check if build was successful
    if [ ! -d "dist" ] && [ ! -d "build" ]; then
        error "Build failed - no dist or build directory found"
    fi
    
    success "Backend built successfully"
}

# Upload to server
upload_to_server() {
    log "Uploading files to server..."
    
    # Create backup of current server files
    # Upload package.json and lock files
    rsync -avz \
    --delete \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='backup-*.tar.gz' \
    "$LOCAL_DIR/" \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/" || error "Failed to upload files"
    success "Files uploaded successfully"
}

# Run server-side deployment
deploy_on_server() {
    log "Running deployment on server..."
    
    # Execute server-side deployment script
    ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DIR && chmod +x server-deploy.sh 2>/dev/null || true"
    ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DIR && ./server-deploy.sh" || error "Server deployment failed"
    
    success "Deployment completed on server"
}

# Test the deployment
test_deployment() {
    log "Testing deployment..."
    
    # Test if server is running
    if ssh "$REMOTE_USER@$REMOTE_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:2000/api" | grep -q "200\|401\|404"; then
        success "Backend is running on port 2000"
    else
        warn "Backend might not be running on port 2000"
    fi
    
    # Test through Apache
    if curl -s -o /dev/null -w '%{http_code}' http://$REMOTE_HOST/api | grep -q "200\|401\|404"; then
        success "API is accessible through Apache at http://$REMOTE_HOST/api"
    else
        warn "API might not be accessible through Apache"
    fi
    
    log "PM2 status on server:"
    ssh "$REMOTE_USER@$REMOTE_HOST" "pm2 status nestjs-backend"
}

# Main deployment function
full_deploy() {
    echo "========================================"
    echo "🚀 Starting NestJS Backend Deployment"
    echo "========================================"
    echo "Local: $LOCAL_DIR"
    echo "Remote: $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"
    echo "========================================"
    
    build_backend
    upload_to_server
    deploy_on_server
    test_deployment
    
    echo "========================================"
    echo "✅ Deployment Completed Successfully!"
    echo "🌐 Your API is live at: http://$REMOTE_HOST/api"
    echo "========================================"
}

# Quick deploy (skip build)
quick_deploy() {
    log "Starting quick deploy (skipping build)..."
    upload_to_server
    deploy_on_server
    test_deployment
}

# Show logs
show_logs() {
    log "Fetching logs from server..."
    ssh "$REMOTE_USER@$REMOTE_HOST" "pm2 logs nestjs-backend --lines 100"
}

# Restart service
restart_service() {
    log "Restarting backend service..."
    ssh "$REMOTE_USER@$REMOTE_HOST" "pm2 restart nestjs-backend"
    success "Service restarted"
    test_deployment
}

# Check status
check_status() {
    log "Checking service status..."
    echo "=== PM2 Status ==="
    ssh "$REMOTE_USER@$REMOTE_HOST" "pm2 status nestjs-backend"
    echo ""
    echo "=== Apache Status ==="
    ssh "$REMOTE_USER@$REMOTE_HOST" "systemctl status apache2 --no-pager"
    echo ""
    echo "=== Test API ==="
    curl -I http://$REMOTE_HOST/api 2>/dev/null || echo "Failed to reach API"
}

# Parse command line arguments
case "$1" in
    "deploy")
        full_deploy
        ;;
    "quick")
        quick_deploy
        ;;
    "logs")
        show_logs
        ;;
    "restart")
        restart_service
        ;;
    "status")
        check_status
        ;;
    "build")
        build_backend
        ;;
    "upload")
        upload_to_server
        ;;
    "test")
        test_deployment
        ;;
    *)
        echo "Usage: $0 {deploy|quick|logs|restart|status|build|upload|test}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (build + upload + deploy)"
        echo "  quick    - Quick deploy (upload + deploy, skip build)"
        echo "  logs     - Show server logs"
        echo "  restart  - Restart backend service"
        echo "  status   - Check service status"
        echo "  build    - Build only (local)"
        echo "  upload   - Upload only"
        echo "  test     - Test deployment"
        exit 1
        ;;
esac