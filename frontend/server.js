const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware: proxy } = require('http-proxy-middleware');

// Import web routes
const webRoutes = require('./routes/web');

const app = express();
const PORT = 3000;
const BACKEND_PORT = 8080;

console.log('🚀 Starting Frontend Server...');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// Web routes for frontend pages
app.use('/', webRoutes);

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
