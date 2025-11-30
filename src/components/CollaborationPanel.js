import React, { useState, useEffect, useRef } from 'react';
import './CollaborationPanel.css';

const CollaborationPanel = ({ sessionId, onCodeChange, onCursorMove }) => {
  const [ws, setWs] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [currentSession, setCurrentSession] = useState(sessionId || '');
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = (sessionId) => {
    if (ws) {
      ws.close();
    }

    const websocket = new WebSocket('ws://localhost:5000');
    
    websocket.onopen = () => {
      console.log('Connected to collaboration server');
      setIsConnected(true);
      setCurrentSession(sessionId);
      
      // Join session
      websocket.send(JSON.stringify({
        type: 'join_session',
        sessionId: sessionId
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection_established':
            console.log(data.message);
            break;
            
          case 'code_update':
            if (onCodeChange && data.sessionId === currentSession) {
              onCodeChange(data.code, data.timestamp);
            }
            break;
            
          case 'cursor_update':
            if (onCursorMove && data.sessionId === currentSession) {
              onCursorMove(data.position, data.user);
            }
            break;
            
          case 'user_joined':
            setConnectedUsers(prev => [...prev, data.user]);
            break;
            
          case 'user_left':
            setConnectedUsers(prev => prev.filter(user => user.id !== data.userId));
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from collaboration server');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (currentSession) {
          connectWebSocket(currentSession);
        }
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWs(websocket);
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws) {
      ws.close();
      setWs(null);
    }
    
    setIsConnected(false);
    setCurrentSession('');
    setConnectedUsers([]);
  };

  const joinSession = () => {
    if (sessionIdInput.trim()) {
      connectWebSocket(sessionIdInput.trim());
    }
  };

  const leaveSession = () => {
    disconnectWebSocket();
    setSessionIdInput('');
  };

  const sendCodeChange = (code) => {
    if (ws && ws.readyState === WebSocket.OPEN && currentSession) {
      ws.send(JSON.stringify({
        type: 'code_change',
        sessionId: currentSession,
        code: code
      }));
    }
  };

  const sendCursorMove = (position) => {
    if (ws && ws.readyState === WebSocket.OPEN && currentSession) {
      ws.send(JSON.stringify({
        type: 'cursor_move',
        sessionId: currentSession,
        position: position,
        user: { id: 'current-user', name: 'You' }
      }));
    }
  };

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    if (sessionId && sessionId !== currentSession) {
      connectWebSocket(sessionId);
    }
  }, [sessionId]);

  return (
    <div className="collaboration-panel">
      <div className="collaboration-header">
        <h3>Collaboration</h3>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {!currentSession ? (
        <div className="session-join">
          <input
            type="text"
            placeholder="Enter session ID"
            value={sessionIdInput}
            onChange={(e) => setSessionIdInput(e.target.value)}
            className="session-input"
          />
          <button
            onClick={joinSession}
            className="join-button"
            disabled={!sessionIdInput.trim()}
          >
            Join Session
          </button>
        </div>
      ) : (
        <div className="session-active">
          <div className="session-info">
            <span className="session-id">Session: {currentSession}</span>
            <button onClick={leaveSession} className="leave-button">
              Leave
            </button>
          </div>

          <div className="connected-users">
            <h4>Connected Users ({connectedUsers.length})</h4>
            <div className="users-list">
              {connectedUsers.length === 0 ? (
                <p className="no-users">No other users in this session</p>
              ) : (
                connectedUsers.map((user) => (
                  <div key={user.id} className="user-item">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{user.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="collaboration-instructions">
        <h4>How to collaborate:</h4>
        <ol>
          <li>Share the session ID with others</li>
          <li>They can join using the same ID</li>
          <li>Code changes will sync in real-time</li>
          <li>Cursor positions are shared</li>
        </ol>
      </div>
    </div>
  );
};

export default CollaborationPanel;
