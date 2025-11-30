# CodeEditor Pro Deployment Script for Windows PowerShell
# This script deploys the application to various platforms

Write-Host "🚀 CodeEditor Pro Deployment Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if required tools are installed
function Test-Requirements {
    Write-Host "📋 Checking requirements..." -ForegroundColor Yellow
    
    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Requirements check passed" -ForegroundColor Green
}

# Build the application for production
function Build-App {
    Write-Host "🔨 Building application for production..." -ForegroundColor Yellow
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
    
    # Build the React app
    Write-Host "🏗️ Building React app..." -ForegroundColor Blue
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
}

# Deploy to Netlify
function Deploy-Netlify {
    Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow
    
    # Check if netlify CLI is installed
    if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing Netlify CLI..." -ForegroundColor Blue
        npm install -g netlify-cli
    }
    
    # Deploy to Netlify
    netlify deploy --prod --dir=build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployed to Netlify successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Netlify deployment failed" -ForegroundColor Red
        exit 1
    }
}

# Deploy to Vercel
function Deploy-Vercel {
    Write-Host "⚡ Deploying to Vercel..." -ForegroundColor Yellow
    
    # Check if vercel CLI is installed
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Blue
        npm install -g vercel
    }
    
    # Deploy to Vercel
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployed to Vercel successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Vercel deployment failed" -ForegroundColor Red
        exit 1
    }
}

# Deploy to GitHub Pages
function Deploy-GitHubPages {
    Write-Host "📄 Deploying to GitHub Pages..." -ForegroundColor Yellow
    
    # Install gh-pages if not already installed
    if (-not (npm list gh-pages --depth=0 2>$null)) {
        Write-Host "📦 Installing gh-pages..." -ForegroundColor Blue
        npm install --save-dev gh-pages
    }
    
    # Add homepage to package.json
    $repoUrl = git config remote.origin.url
    if ($repoUrl) {
        $repoName = ($repoUrl -replace '.*github.com[:/]' -replace '\.git$')
        $homepage = "https://$repoName.github.io/$(Split-Path (Get-Location) -Leaf)"
        npm pkg set homepage="$homepage"
    }
    
    # Deploy to GitHub Pages
    npm run deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployed to GitHub Pages successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ GitHub Pages deployment failed" -ForegroundColor Red
        exit 1
    }
}

# Create Docker deployment
function New-DockerDeployment {
    Write-Host "🐳 Creating Docker deployment..." -ForegroundColor Yellow
    
    # Create Dockerfile for frontend
    $dockerfileContent = @"
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
"@
    
    Set-Content -Path "Dockerfile" -Value $dockerfileContent
    
    # Create nginx configuration
    $nginxConfig = @"
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router
    location / {
        try_files `$uri `$uri/ /index.html;
    }

    # API proxy (if backend is on same domain)
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
"@
    
    Set-Content -Path "nginx.conf" -Value $nginxConfig
    
    # Create docker-compose.yml
    $dockerCompose = @"
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
      - MONGODB_URI=`${MONGODB_URI:-mongodb://mongo:27017/codeeditor}
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
"@
    
    Set-Content -Path "docker-compose.yml" -Value $dockerCompose
    
    Write-Host "✅ Docker configuration created" -ForegroundColor Green
}

# Main deployment menu
function Main {
    Test-Requirements
    
    Write-Host ""
    Write-Host "🎯 Choose deployment option:" -ForegroundColor Cyan
    Write-Host "1) Netlify (Frontend only)" -ForegroundColor White
    Write-Host "2) Vercel (Frontend only)" -ForegroundColor White
    Write-Host "3) GitHub Pages (Frontend only)" -ForegroundColor White
    Write-Host "4) Docker (Full stack)" -ForegroundColor White
    Write-Host "5) Build only" -ForegroundColor White
    Write-Host "6) Exit" -ForegroundColor White
    
    $choice = Read-Host "Enter your choice (1-6)"
    
    switch ($choice) {
        "1" {
            Build-App
            Deploy-Netlify
        }
        "2" {
            Build-App
            Deploy-Vercel
        }
        "3" {
            Build-App
            Deploy-GitHubPages
        }
        "4" {
            Build-App
            New-DockerDeployment
            Write-Host "🐳 Docker files created. Run 'docker-compose up' to start." -ForegroundColor Cyan
        }
        "5" {
            Build-App
            Write-Host "✅ Build completed. Files are in the 'build' directory." -ForegroundColor Green
        }
        "6" {
            Write-Host "👋 Exiting..." -ForegroundColor Cyan
            exit 0
        }
        default {
            Write-Host "❌ Invalid choice" -ForegroundColor Red
            exit 1
        }
    }
}

# Run main function
Main
