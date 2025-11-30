// src/CodeEditor.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import './App.css';

const SUPPORTED_LANGUAGES = {
    javascript: { name: 'JavaScript', extension: javascript() },
    python: { name: 'Python', extension: python() },
    html: { name: 'HTML', extension: html() },
    css: { name: 'CSS', extension: css() }
};

const DEFAULT_CODE = {
    javascript: '// JavaScript Code\nconsole.log("Hello, World!");',
    python: '# Python Code\nprint("Hello, World!")\n\n# Try more complex code:\n# numbers = [1, 2, 3, 4, 5]\n# print(f"Sum: {sum(numbers)}")\n# print(f"Average: {sum(numbers)/len(numbers)}")',
    html: '<!-- HTML Code -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    css: '/* CSS Code - Try styling the preview elements! */\n\n/* Make headings colorful */\nh1 {\n    color: #e74c3c;\n    border-bottom: 3px solid #3498db;\n    padding-bottom: 10px;\n}\n\nh2 {\n    color: #2ecc71;\n    margin-top: 30px;\n}\n\nh3 {\n    color: #f39c12;\n}\n\n/* Style paragraphs */\np {\n    color: #34495e;\n    line-height: 1.6;\n    font-size: 16px;\n}\n\n/* Button styles */\nbutton {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    padding: 12px 24px;\n    border: none;\n    border-radius: 25px;\n    cursor: pointer;\n    font-weight: bold;\n    transition: all 0.3s ease;\n}\n\nbutton:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);\n}\n\nbutton.primary {\n    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);\n}\n\nbutton.secondary {\n    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);\n}\n\n/* Card styling */\n.demo-card {\n    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);\n    border: 2px solid #ff6b6b;\n    padding: 20px;\n    border-radius: 15px;\n    box-shadow: 0 8px 25px rgba(0,0,0,0.1);\n    transition: all 0.3s ease;\n}\n\n.demo-card:hover {\n    transform: translateY(-5px);\n    box-shadow: 0 15px 35px rgba(0,0,0,0.2);\n}\n\n/* Box styling */\n.box {\n    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);\n    color: white;\n    padding: 15px;\n    border-radius: 10px;\n    text-align: center;\n    font-weight: bold;\n    font-size: 18px;\n    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\n}\n\n/* Grid item styling */\n.grid-item {\n    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);\n    border: 3px solid #667eea;\n    padding: 20px;\n    text-align: center;\n    border-radius: 12px;\n    font-weight: bold;\n    color: #2c3e50;\n    transition: all 0.3s ease;\n}\n\n.grid-item:hover {\n    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);\n    transform: scale(1.05);\n    border-color: #f39c12;\n}\n\n/* Form styling */\ninput, textarea {\n    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);\n    border: 2px solid #667eea;\n    padding: 12px;\n    border-radius: 8px;\n    font-size: 16px;\n    color: #2c3e50;\n    transition: all 0.3s ease;\n}\n\ninput:focus, textarea:focus {\n    outline: none;\n    border-color: #f39c12;\n    box-shadow: 0 0 15px rgba(243, 156, 18, 0.3);\n    transform: scale(1.02);\n}'
};

const CodeEditor = () => {
    const editorRef = useRef();
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [fontSize, setFontSize] = useState(14);
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState('ready');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const pyodideRef = useRef(null);
    const iframeRef = useRef(null);
    const viewRef = useRef(null);

    useEffect(() => {
        const loadPyodide = async () => {
            if (!pyodideRef.current) {
                try {
                    pyodideRef.current = await window.loadPyodide({
                        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/"
                    });
                    console.log("Pyodide loaded successfully.");
                } catch (error) {
                    console.error("Failed to load Pyodide:", error);
                }
            }
        };
        loadPyodide();

        const languageExtension = SUPPORTED_LANGUAGES[language]?.extension || javascript();
        const defaultCode = DEFAULT_CODE[language] || '';
        
        const startState = EditorState.create({
            doc: defaultCode,
            extensions: [
                basicSetup,
                languageExtension,
                oneDark,
                EditorView.theme({
                    '&': { fontSize: `${fontSize}px` },
                    '.cm-content': { fontFamily: 'Fira Code, Consolas, monospace' }
                })
            ],
        });

        const view = new EditorView({
            state: startState,
            parent: editorRef.current,
        });
        
        viewRef.current = view;

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, [language, fontSize]);

    const runCode = useCallback(async () => {
        if (!viewRef.current) return;
        
        setIsRunning(true);
        setStatus('running');
        setOutput('');
        
        try {
            const code = viewRef.current.state.doc.toString();
            console.log(`Running ${SUPPORTED_LANGUAGES[language].name} code:`, code);
            
            let result = '';
            
            switch (language) {
                case 'javascript':
                    result = await runJavaScript(code);
                    break;
                case 'python':
                    result = await runPython(code);
                    break;
                case 'html':
                case 'css':
                    result = await runHTMLCSS(code, language);
                    break;
                default:
                    result = `${SUPPORTED_LANGUAGES[language].name} execution is not supported in the browser.`;
            }
            
            setOutput(result);
            setStatus('success');
        } catch (error) {
            const errorMsg = `Error: ${error.message}`;
            setOutput(errorMsg);
            setStatus('error');
        } finally {
            setIsRunning(false);
            setTimeout(() => setStatus('ready'), 2000);
        }
    }, [language]);
    
    const runJavaScript = (code) => {
        return new Promise((resolve) => {
            const processedCode = code.replace(/print\(/g, 'console.log(');
            const originalLog = console.log;
            const logs = [];
            
            console.log = (...args) => {
                logs.push(args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' '));
            };
            
            try {
                // eslint-disable-next-line no-new-func
                new Function(processedCode)();
                resolve(logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)');
            } catch (error) {
                resolve(`JavaScript Error: ${error.message}`);
            } finally {
                console.log = originalLog;
            }
        });
    };
    
    const runPython = async (code) => {
        if (!pyodideRef.current) {
            return 'Pyodide is still loading...';
        }
        
        try {
            // Import sys and capture stdout
            await pyodideRef.current.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
            `);
            
            // Run the user's code
            await pyodideRef.current.runPythonAsync(code);
            
            // Get the captured output
            const result = pyodideRef.current.runPython(`
output = sys.stdout.getvalue()
sys.stdout = sys.__stdout__  # Restore original stdout
output
            `);
            
            return result || 'Code executed successfully (no output)';
        } catch (error) {
            return `Python Error: ${error.message}`;
        }
    };
    
    const runHTMLCSS = (code, lang) => {
        if (!iframeRef.current) {
            return `${lang.toUpperCase()} preview not available`;
        }
        
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        
        if (lang === 'html') {
            doc.open();
            doc.write(code);
            doc.close();
            return 'HTML rendered in preview panel.';
        } else {
            // For CSS, wrap it in a comprehensive HTML structure with better preview elements
            const wrappedCode = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        /* Reset and base styles */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            padding: 20px;
                            background: #f5f5f5;
                        }
                        
                        /* User's custom styles - injected here */
                        ${code}
                        
                        /* Demo content styles that can be overridden */
                        .demo-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        
                        .demo-header {
                            margin-bottom: 30px;
                        }
                        
                        .demo-section {
                            margin-bottom: 25px;
                        }
                        
                        .demo-buttons {
                            display: flex;
                            gap: 10px;
                            margin-bottom: 25px;
                        }
                        
                        .demo-card {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 6px;
                            margin-bottom: 15px;
                        }
                        
                        .demo-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                            margin-bottom: 25px;
                        }
                        
                        .grid-item {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            border: 2px dashed #dee2e6;
                            border-radius: 4px;
                            transition: all 0.3s ease;
                        }
                        
                        .grid-item:hover {
                            border-color: #3498db;
                            background: #e3f2fd;
                        }
                        
                        /* Default button styles that can be overridden */
                        button {
                            padding: 12px 24px;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.3s ease;
                            background: #007bff;
                            color: white;
                        }
                        
                        button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        }
                        
                        /* Default form styles */
                        input, textarea {
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                            transition: border-color 0.3s ease;
                        }
                        
                        input:focus, textarea:focus {
                            outline: none;
                            border-color: #3498db;
                            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="demo-container">
                        <div class="demo-header">
                            <h1>CSS Preview</h1>
                            <p>Your CSS styles are applied to the elements below</p>
                        </div>
                        
                        <div class="demo-section">
                            <h2>Typography</h2>
                            <p>This paragraph demonstrates how your CSS affects text elements.</p>
                            <h3>Subheading Example</h3>
                        </div>
                        
                        <div class="demo-section">
                            <h2>Buttons</h2>
                            <div class="demo-buttons">
                                <button>Default Button</button>
                                <button class="primary">Primary Button</button>
                                <button class="secondary">Secondary Button</button>
                            </div>
                        </div>
                        
                        <div class="demo-section">
                            <h2>Cards & Boxes</h2>
                            <div class="demo-card">
                                <h3>Card Title</h3>
                                <p>This is a demo card to test your CSS styling.</p>
                                <div class="box">Styled Box Element</div>
                            </div>
                        </div>
                        
                        <div class="demo-section">
                            <h2>Grid Layout</h2>
                            <div class="demo-grid">
                                <div class="grid-item">Grid Item 1</div>
                                <div class="grid-item">Grid Item 2</div>
                                <div class="grid-item">Grid Item 3</div>
                                <div class="grid-item">Grid Item 4</div>
                            </div>
                        </div>
                        
                        <div class="demo-section">
                            <h2>Form Elements</h2>
                            <input type="text" placeholder="Text input" />
                            <br/><br/>
                            <textarea placeholder="Textarea"></textarea>
                        </div>
                    </div>
                </body>
                </html>
            `;
            doc.open();
            doc.write(wrappedCode);
            doc.close();
            return 'CSS rendered in preview panel with comprehensive demo content.';
        }
    };

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            console.log('Save shortcut pressed');
        }
    }, [runCode]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    
    const increaseFontSize = () => {
        setFontSize(prev => Math.min(prev + 2, 24));
    };
    
    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(prev - 2, 10));
    };
    
    const clearOutput = () => {
        setOutput('');
        setStatus('ready');
    };
    
    const toggleFullscreen = () => {
        console.log('Toggling fullscreen, current state:', isFullscreen);
        setIsFullscreen(!isFullscreen);
    };

    return (
    <div className="main-container">
        <div className="editor-panel">
            <div className="editor-toolbar">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="language-selector"
                >
                    {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                        <option key={key} value={key}>{lang.name}</option>
                    ))}
                </select>
                
                <div className="font-size-controls">
                    <button 
                        className="font-size-btn" 
                        onClick={decreaseFontSize}
                        disabled={fontSize <= 10}
                    >
                        A-
                    </button>
                    <span className="font-size-display">{fontSize}px</span>
                    <button 
                        className="font-size-btn" 
                        onClick={increaseFontSize}
                        disabled={fontSize >= 24}
                    >
                        A+
                    </button>
                </div>
                
                <button 
                    onClick={runCode} 
                    disabled={isRunning}
                    className="run-button"
                >
                    {isRunning && <span className="loading"></span>}
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </div>
            
            <div className="editor-container">
                <div ref={editorRef} />
            </div>
            
            <div className="status-bar">
                <div className="status-item">
                    <span className={`status-dot ${status === 'error' ? 'error' : status === 'running' ? 'running' : ''}`}></span>
                    <span>Language: {SUPPORTED_LANGUAGES[language].name}</span>
                </div>
                <div className="status-item">
                    <span>Lines: {viewRef.current ? viewRef.current.state.doc.lines : 0}</span>
                </div>
                <div className="status-item">
                    <span>Characters: {viewRef.current ? viewRef.current.state.doc.length : 0}</span>
                </div>
            </div>
        </div>
        
        <div className="output-panel">
            <div className="output-header">
                <span>Output</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(language === 'html' || language === 'css') && (
                        <button 
                            onClick={toggleFullscreen}
                            className={`font-size-btn fullscreen-btn`}
                            style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                            title="Toggle fullscreen preview"
                        >
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </button>
                    )}
                    {/* Debug indicator */}
                    {isFullscreen && (
                        <div style={{ 
                            position: 'fixed', 
                            top: '70px', 
                            left: '20px', 
                            background: 'red', 
                            color: 'white', 
                            padding: '5px 10px', 
                            borderRadius: '5px', 
                            fontSize: '12px',
                            zIndex: 10001 
                        }}>
                            FULLSCREEN MODE
                        </div>
                    )}
                    <button 
                        onClick={clearOutput}
                        className="font-size-btn"
                        style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                    >
                        Clear
                    </button>
                </div>
            </div>
            
            {!isFullscreen && (
                <div className="output-content">
                    {output ? (
                        <pre className={status === 'error' ? 'error' : status === 'success' ? 'success' : 'info'}>
                            {output}
                        </pre>
                    ) : (
                        <div className="info" style={{ opacity: 0.6 }}>
                            {language === 'html' || language === 'css' 
                                ? 'Run code to see preview...' 
                                : 'Run code to see output...'}
                        </div>
                    )}
                </div>
            )}
            
            {(language === 'html' || language === 'css') && (
                <>
                    {!isFullscreen && (
                        <div className="output-header">
                            <span>Preview</span>
                        </div>
                    )}
                    <div style={{ 
                        margin: isFullscreen ? '0' : '1rem', 
                        borderRadius: isFullscreen ? '0' : '8px', 
                        overflow: 'hidden', 
                        border: isFullscreen ? 'none' : '1px solid rgba(102, 126, 234, 0.2)',
                        height: isFullscreen ? 'calc(100vh - 60px)' : '200px',
                        position: isFullscreen ? 'fixed' : 'relative',
                        top: isFullscreen ? '60px' : 'auto',
                        left: isFullscreen ? '0' : 'auto',
                        right: isFullscreen ? '0' : 'auto',
                        bottom: isFullscreen ? '0' : 'auto',
                        zIndex: isFullscreen ? '9999' : 'auto',
                        background: isFullscreen ? 'white' : 'transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isFullscreen ? 'scale(1)' : 'scale(1)',
                        display: 'block',
                        visibility: 'visible',
                        opacity: 1
                    }}
                    >
                        <iframe 
                            ref={iframeRef} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                border: 'none',
                                background: 'white'
                            }}
                            title="HTML/CSS Preview"
                        />
                        {isFullscreen && (
                            <button
                                onClick={toggleFullscreen}
                                style={{
                                    position: 'fixed',
                                    top: '80px',
                                    right: '20px',
                                    background: 'rgba(0, 0, 0, 0.8)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    zIndex: 10000,
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                    display: 'block',
                                    visibility: 'visible',
                                    opacity: 1
                                }}
                            >
                                ✕ Exit Fullscreen
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    </div>
);
};

export default CodeEditor;
