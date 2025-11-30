# CodeEditor Pro 🚀

**A professional-grade online code editor with real-time collaboration, multi-language support, and stunning visual design.**

<div align="center">

![CodeEditor Pro](https://img.shields.io/badge/CodeEditor-Pro-blue?style=for-the-badge&logo=visual-studio-code)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://your-demo-link.com)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/codeeditor-pro?style=for-the-badge&logo=github)](https://github.com/yourusername/codeeditor-pro)

</div>

---

## 🌟 Why CodeEditor Pro?

CodeEditor Pro isn't just another code editor—it's a **complete development environment** in your browser. Built with modern technologies and designed for both beginners and professional developers, it combines the power of desktop IDEs with the convenience of web-based tools.

### 🎯 Perfect For:
- **Learning to code** with instant feedback
- **Quick prototyping** and testing ideas
- **Teaching programming** with live examples
- **Collaborative coding** sessions
- **Code interviews** and technical assessments
- **API testing** and documentation

---

## ✨ Key Features

### 🎨 **Professional Interface**
- **Glass Morphism Design**: Modern translucent UI with blur effects
- **Dark Theme**: Eye-friendly dark mode with gradient accents
- **Responsive Layout**: Seamlessly adapts to any screen size
- **Split Pane View**: Adjustable editor and output panels
- **Font Size Control**: Dynamic text sizing (10px-24px)
- **Status Bar**: Real-time line count and execution status

### 💻 **Multi-Language Support**
- **JavaScript** (ES6+ with console.log handling)
- **Python** (Pyodide integration with stdout capture)
- **HTML** (Live preview with iframe rendering)
- **CSS** (Comprehensive preview with demo elements)
- **Syntax Highlighting**: Professional code coloring
- **Auto-completion**: Intelligent code suggestions
- **Error Highlighting**: Real-time error detection

### 🚀 **Advanced Code Execution**
- **Browser-Based**: No server setup required for frontend
- **Real-Time Output**: Instant code execution results
- **Error Handling**: Comprehensive error reporting
- **HTML/CSS Preview**: Live rendering in iframe
- **Python Console**: Full stdout capture and display
- **JavaScript Debugging**: Enhanced console.log support

### 🤝 **Collaboration Features**
- **Real-Time Sync**: Code changes broadcast instantly
- **Session Management**: Join/create coding sessions
- **Cursor Tracking**: See other users' cursor positions
- **User Presence**: Live user list with status indicators
- **WebSocket Communication**: Low-latency real-time updates

### 🔌 **Backend Integration**
- **RESTful API**: Complete CRUD operations
- **GraphQL Support**: Flexible data querying
- **MongoDB Integration**: Persistent code snippet storage
- **Redis Caching**: Optimized session management
- **Health Monitoring**: Service status endpoints

---

## 🛠️ Technology Stack

### Frontend
```javascript
React 19.1.0          // Modern UI framework
CodeMirror 6          // Professional code editor
TailwindCSS          // Utility-first styling
Fira Code            // Developer-friendly font
Inter                // Modern UI typography
```

### Backend
```javascript
Node.js 18+          // Runtime environment
Express 4.18.2       // Web framework
MongoDB              // NoSQL database
Redis                // In-memory cache
WebSocket            // Real-time communication
GraphQL              // Query language
```

### Development Tools
```javascript
ESLint               // Code quality
Prettier             // Code formatting
Hot Module Replacement // Instant updates
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **npm** or **yarn**
- **MongoDB** (optional, for full features)
- **Redis** (optional, for collaboration)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codeeditor-pro.git
cd codeeditor-pro

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Individual Server Setup

```bash
# Backend Server
cd backend
npm install
npm start
# → http://localhost:5000

# Frontend Server  
cd frontend
npm install
npm start
# → http://localhost:3000
```

---

## 📖 Usage Guide

### Basic Usage
1. **Select Language**: Choose from JavaScript, Python, HTML, or CSS
2. **Write Code**: Start typing in the editor with syntax highlighting
3. **Run Code**: Press `Ctrl+Enter` or click the "Run Code" button
4. **View Output**: See results in the output panel or preview

### Advanced Features

#### 🎨 CSS Preview
```css
/* Your CSS automatically applies to rich demo content */
h1 { color: #e74c3c; }
button { 
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 25px;
}
```

#### 🐍 Python Execution
```python
# Full Python support with stdout capture
print("Hello, World!")
numbers = [1, 2, 3, 4, 5]
print(f"Sum: {sum(numbers)}")
```

#### ⚡ JavaScript Debugging
```javascript
// Enhanced console.log handling
const user = { name: "Alice", age: 25 };
console.log("User data:", user); // Pretty-printed objects
```

#### 🎯 Keyboard Shortcuts
- `Ctrl+Enter` - Run code
- `Ctrl+S` - Save (placeholder)
- `Ctrl+/` - Toggle comment (planned)

---

## 🏗️ Architecture

```
codeeditor-pro/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── styles/         # CSS files
│   └── public/             # Static assets
├── backend/                 # Node.js server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database models
│   │   └── middleware/     # Express middleware
│   └── config/             # Configuration files
└── docs/                   # Documentation
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Backend Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codeeditor
REDIS_URL=redis://localhost:6379

# Frontend Configuration  
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

### Customization
- **Themes**: Modify CSS variables for color schemes
- **Languages**: Add new language support via CodeMirror extensions
- **Plugins**: Extend functionality with custom components

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow **ESLint** configuration
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed

---

## 📊 Roadmap

### Version 2.0 (Coming Soon)
- [ ] **More Languages**: TypeScript, Rust, Go, Ruby
- [ ] **File System**: Upload/download code files
- [ ] **Code Sharing**: Public/private snippets
- [ ] **Themes**: Light mode and custom themes
- [ ] **Extensions**: Plugin system
- [ ] **Mobile App**: React Native version

### Version 3.0 (Future)
- [ ] **AI Integration**: Code completion and suggestions
- [ ] **Version Control**: Git integration
- [ ] **Collaboration**: Video chat and screen sharing
- [ ] **Deployment**: One-click deployment to various platforms

---

## 🐛 Troubleshooting

### Common Issues

**Python not loading?**
```bash
# Check browser console for Pyodide loading errors
# Ensure no ad-blockers are blocking CDN requests
```

**Backend connection failed?**
```bash
# Verify MongoDB and Redis are running
# Check environment variables in .env file
```

**CSS not applying?**
```bash
# Clear browser cache
# Check for CSS syntax errors in console
```

### Performance Tips
- Use **Chrome/Edge** for best performance
- Disable **ad-blockers** for Pyodide CDN
- Close **unused browser tabs** for better memory

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **CodeMirror** - Amazing code editor component
- **Pyodide** - Python in the browser
- **React** - UI framework
- **Express** - Backend framework
- **MongoDB** - Database solution

---

## 📞 Support & Community

- 📧 **Email**: support@codeeditor.pro
- 💬 **Discord**: [Join our community](https://discord.gg/codeeditor)
- 🐦 **Twitter**: [@CodeEditorPro](https://twitter.com/codeeditorpro)
- 📱 **Issues**: [GitHub Issues](https://github.com/yourusername/codeeditor-pro/issues)

---

<div align="center">

**⭐ Star this repo if it helped you!**

Made with ❤️ by [Your Name](https://github.com/yourusername)

[![Backers](https://opencollective.com/codeeditor-pro/tiers/badge.svg)](https://opencollective.com/codeeditor-pro)

</div>

**Made with ❤️ by the CodeEditor Pro team**
