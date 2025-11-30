// src/App.js
import React from 'react';
import CodeEditor from './CodeEditor';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <div className="logo">CodeEditor Pro</div>
        <div style={{ fontSize: '0.9rem', color: '#999' }}>
          Modern Online Code Editor
        </div>
      </header>
      
      <main className="main-container">
        <CodeEditor />
      </main>
    </div>
  );
}

export default App;
