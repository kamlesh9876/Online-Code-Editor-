const express = require('express');
const { WebSocketServer } = require('ws');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const codeSnippetsRoutes = require('./routes/codeSnippets');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeeditor')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will continue without MongoDB. Some features may not work.');
  });

// Redis connection
let redisClient = null;
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        // Stop retrying after 3 attempts
        if (options.attempt > 3) {
          console.log('Redis connection failed after 3 attempts. Continuing without Redis.');
          return false;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') {
        console.error('Redis Client Error:', err.message);
      }
    });

    redisClient.on('connect', () => console.log('Redis Client Connected'));

    await redisClient.connect();
    return true;
  } catch (err) {
    console.log('Redis not available. Server will continue without Redis.');
    redisClient = null;
    return false;
  }
};

// Try to connect to Redis
connectRedis();

// Routes
app.use('/api/snippets', codeSnippetsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisClient && redisClient.isOpen ? 'connected' : 'disconnected'
    }
  });
});

const schema = buildSchema(`
  type Query {
    hello: String
    snippets: [Snippet]
    snippet(id: ID!): Snippet
  }
  
  type Mutation {
    createSnippet(title: String!, language: String!, code: String!, author: String!): Snippet
  }
  
  type Snippet {
    id: ID!
    title: String!
    language: String!
    code: String!
    author: String!
    createdAt: String
  }
`);

const root = {
    hello: () => 'Hello from CodeEditor Pro API!',
    snippets: async () => {
      // Would implement GraphQL snippet fetching here
      return [];
    },
    snippet: async ({ id }) => {
      // Would implement GraphQL snippet fetching by ID here
      return null;
    },
    createSnippet: async ({ title, language, code, author }) => {
      // Would implement GraphQL snippet creation here
      return { id: '1', title, language, code, author, createdAt: new Date().toISOString() };
    }
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

const server = app.listen(PORT, () => {
    console.log(`🚀 CodeEditor Pro Server running on port ${PORT}`);
    console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
    console.log(`🔗 REST API: http://localhost:${PORT}/api`);
});

const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total clients: ${clients.size}`);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle different message types
      switch (data.type) {
        case 'code_change':
          // Broadcast code changes to other clients in the same session
          clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'code_update',
                sessionId: data.sessionId,
                code: data.code,
                timestamp: new Date().toISOString()
              }));
            }
          });
          break;
          
        case 'cursor_move':
          // Broadcast cursor position
          clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'cursor_update',
                sessionId: data.sessionId,
                position: data.position,
                user: data.user
              }));
            }
          });
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'Welcome to CodeEditor Pro WebSocket!'
  }));
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    if (redisClient && redisClient.isOpen) {
      redisClient.quit();
    }
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = app;
