const express = require('express');
const path = require('path');
const { createProxyMiddleware: proxy } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;
const BACKEND_PORT = 8080;

console.log('🚀 Starting Frontend Server...');

// Proxy API calls to backend
app.use('/api', proxy({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.status(500).send('Backend server is not available');
  }
}));

// Proxy OpenAPI and Swagger UI to backend
app.use('/swagger-ui', proxy({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true
}));

app.use('/openapi.json', proxy({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true
}));

// Serve all other requests from the backend server (for web pages)
app.use('/', proxy({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.status(500).send(`
      <h1>Frontend Server Error</h1>
      <p>Cannot connect to backend server at http://localhost:${BACKEND_PORT}</p>
      <p>Please make sure the backend server is running with: <code>npm start</code></p>
    `);
  }
}));

app.listen(PORT, () => {
  console.log(`🌐 Frontend Server is running on http://localhost:${PORT}`);
  console.log(`🔗 Proxying to backend server at http://localhost:${BACKEND_PORT}`);
  console.log(`📋 Available at:`);
  console.log(`   - Frontend: http://localhost:${PORT}`);
  console.log(`   - API: http://localhost:${PORT}/api`);
  console.log(`   - Swagger: http://localhost:${PORT}/swagger-ui`);
});
