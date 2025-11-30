# Simple Deployment Script for CodeEditor Pro
Write-Host "🚀 CodeEditor Pro Deployment" -ForegroundColor Green

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Requirements OK" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

# Build app
Write-Host "🏗️ Building app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📁 Build files are in the 'build' folder" -ForegroundColor Cyan
    Write-Host "🌐 You can now deploy to:" -ForegroundColor White
    Write-Host "   - Netlify: Drag 'build' folder to app.netlify.com" -ForegroundColor White
    Write-Host "   - Vercel: Run 'vercel --prod'" -ForegroundColor White
    Write-Host "   - GitHub Pages: Run 'npm run deploy'" -ForegroundColor White
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
