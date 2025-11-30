#!/bin/bash

# CodeEditor Pro Deployment Script
# This script deploys the application to various platforms

echo "🚀 CodeEditor Pro Deployment Script"
echo "=================================="

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Build the application for production
build_app() {
    echo "🔨 Building application for production..."
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Build the React app
    echo "🏗️ Building React app..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Deploy to Netlify
deploy_netlify() {
    echo "🌐 Deploying to Netlify..."
    
    # Check if netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Deploy to Netlify
    netlify deploy --prod --dir=build
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployed to Netlify successfully"
    else
        echo "❌ Netlify deployment failed"
        exit 1
    fi
}

# Deploy to Vercel
deploy_vercel() {
    echo "⚡ Deploying to Vercel..."
    
    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployed to Vercel successfully"
    else
        echo "❌ Vercel deployment failed"
        exit 1
    fi
}

# Deploy to GitHub Pages
deploy_github_pages() {
    echo "📄 Deploying to GitHub Pages..."
    
    # Install gh-pages if not already installed
    if ! npm list gh-pages &> /dev/null; then
        echo "📦 Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Add homepage to package.json
    npm pkg set homepage="https://$(git config remote.origin.url | sed 's/.*:\/\/github.com\///;s/\.git//').github.io/$(basename $(git rev-parse --show-toplevel))"
    
    # Deploy to GitHub Pages
    npm run deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployed to GitHub Pages successfully"
    else
        echo "❌ GitHub Pages deployment failed"
        exit 1
    fi
}

# Deploy to Railway (for backend)
deploy_railway() {
    echo "🚂 Deploying backend to Railway..."
    
    # Check if railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "📦 Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Navigate to backend directory
    cd backend
    
    # Deploy to Railway
    railway deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Backend deployed to Railway successfully"
    else
        echo "❌ Railway deployment failed"
        exit 1
    fi
    
    cd ..
}

# Deploy to Heroku (for backend)
deploy_heroku() {
    echo "🌸 Deploying backend to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI is not installed. Please install it first."
        echo "Visit: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Navigate to backend directory
    cd backend
    
    # Create Heroku app
    heroku create
    
    # Set buildpack
    heroku buildpacks:set heroku/nodejs
    
    # Deploy
    git push heroku main
    
    if [ $? -eq 0 ]; then
        echo "✅ Backend deployed to Heroku successfully"
    else
        echo "❌ Heroku deployment failed"
        exit 1
    fi
    
    cd ..
}

# Create Docker deployment
create_docker() {
    echo "🐳 Creating Docker deployment..."
    
    # Create Dockerfile for frontend
    cat > Dockerfile << 'EOF'
# Multi-stage build for React app
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

    # Create nginx configuration
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if backend is on same domain)
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

    # Create docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:5000

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=${MONGODB_URI:-mongodb://mongo:27017/codeeditor}
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
EOF

    echo "✅ Docker configuration created"
}

# Main deployment menu
main() {
    check_requirements
    
    echo ""
    echo "🎯 Choose deployment option:"
    echo "1) Netlify (Frontend only)"
    echo "2) Vercel (Frontend only)"
    echo "3) GitHub Pages (Frontend only)"
    echo "4) Railway (Backend only)"
    echo "5) Heroku (Backend only)"
    echo "6) Docker (Full stack)"
    echo "7) Build only"
    echo "8) Exit"
    
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1)
            build_app
            deploy_netlify
            ;;
        2)
            build_app
            deploy_vercel
            ;;
        3)
            build_app
            deploy_github_pages
            ;;
        4)
            deploy_railway
            ;;
        5)
            deploy_heroku
            ;;
        6)
            build_app
            create_docker
            echo "🐳 Docker files created. Run 'docker-compose up' to start."
            ;;
        7)
            build_app
            echo "✅ Build completed. Files are in the 'build' directory."
            ;;
        8)
            echo "👋 Exiting..."
            exit 0
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
}

# Run main function
main
