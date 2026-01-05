#!/bin/bash

# Server-side deployment script
# Run this on the server after files are uploaded

echo "🔧 Server-side deployment started..."
echo "========================================"

# Navigate to backend directory
cd /var/www/nest-backend

# Install/update dependencies
echo "📦 Installing dependencies..."
yarn

# Check if .env exists, if not create from template
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, creating from template..."
    cp .env.template .env
    echo "⚠️  Please update .env file with your configuration!"
fi

# Stop existing PM2 process
echo "🛑 Stopping existing PM2 process..."
pm2 stop nestjs-backend 2>/dev/null || true
pm2 delete nestjs-backend 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting NestJS application..."
pm2 start dist/main.js --name nestjs-backend

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot (if not already)
echo "🔧 Setting up PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || echo "PM2 startup already configured"

echo "========================================"
echo "✅ Server-side setup completed!"
echo ""
echo "📊 PM2 Status:"
pm2 status nestjs-backend
echo ""
echo "📝 Check logs: pm2 logs nestjs-backend"
echo "🌐 Test API: curl http://localhost:2000/api"
echo "🌐 Test through Apache: curl http://localhost/api"